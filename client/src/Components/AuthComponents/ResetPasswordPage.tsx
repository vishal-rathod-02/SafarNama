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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        {showSuccess ? (
          <SuccessState />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Reset your password
            </h2>

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
                  className="text-red-600 text-sm font-medium"
                >
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-linear-to-r from-green-500 to-emerald-600
                           text-white font-bold py-3 rounded-lg
                           hover:shadow-lg transition disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset password"}
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
      <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />

      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-1 focus:ring-green-500"
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
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
    className="text-center space-y-4"
  >
    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
      <CheckCircle className="text-green-600 w-6 h-6" />
    </div>

    <h3 className="text-xl font-bold text-gray-800">
      Password updated 🎉
    </h3>

    <p className="text-sm text-gray-600">
      You can now log in using your new password.
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
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded ${
              strength > i ? levels[strength - 1]?.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength:{" "}
        <span className="font-semibold">
          {levels[strength - 1]?.label || "Too weak"}
        </span>
      </p>
    </div>
  );
};
