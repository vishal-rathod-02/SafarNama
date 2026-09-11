import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Eye, EyeOff, Lock, LucideIcon } from "lucide-react";
import { AuthService } from "@/Services/Auth/Auth.service";
import { useToast } from "@/Components/Shared/ToastContext";
import { useAuthModal } from "./AuthModalContext";


export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { openModal } = useAuthModal();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold">
          Invalid or expired reset link
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm)
      return setError("Passwords do not match.");

    try {
      setIsLoading(true);

        const res = await AuthService.resetPassword(token, { newPassword: password });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Reset failed");

      setShowSuccess(true);

      setTimeout(() => {
        openModal("login");
        navigate("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      addToast({ message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full relative z-10"
      >
        {showSuccess ? (
          <SuccessState />
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Reset your password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose a strong new password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                Icon={Lock}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordStrength password={password} />

              <PasswordInput
                Icon={Lock}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              {error && (
                <p
                  role="alert"
                  className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50"
                >
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className="w-full bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500
                           text-slate-950 font-black py-3.5 rounded-xl
                           shadow-lg shadow-amber-500/25 transition disabled:opacity-50 tracking-wide mt-2"
              >
                {isLoading ? "Resetting..." : "Update Password"}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};


const PasswordInput = ({
  Icon,
  value,
  onChange,
  placeholder,
}: {
  Icon: LucideIcon;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl
                   text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                   focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const SuccessState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-4 py-4"
  >
    <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
      <CheckCircle className="text-emerald-500 w-8 h-8" />
    </div>

    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
      Password updated 🎉
    </h3>

    <p className="text-sm text-slate-600 dark:text-slate-400">
      You can now log in using your new password. Redirecting you...
    </p>
  </motion.div>
);

const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

const PasswordStrength = ({ password }: { password: string }) => {
  const strength = getPasswordStrength(password);

  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength > i ? levels[strength - 1]?.color : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Password strength:{" "}
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {levels[strength - 1]?.label || "Too weak"}
        </span>
      </p>
    </div>
  );
};
