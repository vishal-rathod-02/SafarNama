import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { AuthService } from "@/Services/Auth/Auth.service";
import { useToast } from "@/Components/Shared/ToastContext";

export const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await AuthService.verifyEmail(token!);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message);
        }

        setStatus("success");
        setMessage("Your email has been verified successfully 🎉");

        addToast({
          message: "Email verified! You can now log in.",
          type: "success",
        });

        setTimeout(() => navigate("/"), 2500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full text-center relative z-10"
      >
        {status === "loading" && (
          <div className="py-6 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-amber-500 border-t-transparent mx-auto" />
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
              Verifying your email...
            </p>
            <p className="text-slate-400 text-xs">This will take just a second</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{message}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Redirecting you to start your adventure...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-600 dark:text-red-400">
              Verification Failed
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
