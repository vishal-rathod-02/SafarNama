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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              Verifying your email...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">{message}</h2>
            <p className="text-sm text-gray-600 mt-2">
              Redirecting to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600">
              Verification Failed
            </h2>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </>
        )}
      </motion.div>
    </div>
  );
};
