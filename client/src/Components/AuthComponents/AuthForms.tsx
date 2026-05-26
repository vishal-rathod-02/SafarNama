import { useEffect, useState } from "react";
import { useToast } from "../Shared/ToastContext";
import { useAuth } from "./AuthContext";
import { AuthService } from "@/Services/Auth/Auth.service";
import { Lock, Mail, User, Eye, EyeOff, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleIcon } from "../Shared/icons";
import { useAuthModal } from "./AuthModalContext";

const Separator = () => (
    <div className="flex items-center space-x-2">
      <hr className="grow border-gray-200" />
      <span className="text-gray-400 text-xs font-semibold">OR</span>
      <hr className="grow border-gray-200" />
    </div>
  );

  
const SocialLoginButtons = () => {
  const { addToast } = useToast();
  return (
    <button
      className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      onClick={() => addToast({ message: "Google Sign-In coming soon!", type: "info" })}
    >
      <GoogleIcon className="w-5 h-5" />
      <span className="font-semibold text-gray-700">Continue with Google</span>
    </button>
  );
};

const RESEND_COOLDOWN = 30;

/* ------------------- Login Form ------------------- */

export const LoginForm = ({ switchMode, closeModal }: any) => {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  /* ---------------- Cooldown Timer ---------------- */
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ---------------- Resend Verification ---------------- */
  const handleResend = async () => {
    if (!email) {
      addToast({
        message: "Please enter your email to resend verification.",
        type: "warning",
      });
      return;
    }

    try {
      setIsResending(true);

      const res = await AuthService.resendVerification({ email });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message);
      }

      addToast({
        message: "Verification email sent 📩 Please check your inbox.",
        type: "success",
      });

      setShowResend(false);
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      addToast({
        message: err.message || "Failed to resend verification email.",
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  /* ---------------- Login Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await AuthService.login({ email, password });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      await login(data.data.token);
      addToast({
        message: "Welcome back! 🌍 Ready to plan your journey?",
        type: "success",
      });
      closeModal();
    } catch (err: any) {
      const msg = err.message || "Login failed";

      if (msg.toLowerCase().includes("verify")) {
        setError("Your email address is not verified yet.");
        setShowResend(true);

        addToast({
          message: "Please verify your email to continue.",
          type: "warning",
        });
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Welcome Back 👋
      </h2>

      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-50">
          <div className="animate-spin h-8 w-8 border-b-2 border-green-500 rounded-full" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon
          Icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          required
        />

        <InputWithIcon Icon={Lock} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e: any) => setPassword(e.target.value)} required  showForgot/>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold disabled:opacity-50"
        >
          {isLoading ? "Logging you in..." : "Login"}
        </motion.button>
      </form>

      {/* Resend Verification */}
      {showResend && (
        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="w-full text-sm text-green-600 hover:underline disabled:opacity-50"
        >
          {cooldown > 0
            ? `Resend available in ${cooldown}s`
            : isResending
            ? "Sending verification email..."
            : "Resend verification email"}
        </button>
      )}

      <p className="text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <button
          onClick={() => switchMode("signup")}
          className="font-semibold text-green-600 hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};


/* ------------------- Signup Form ------------------- */
export const SignupForm = ({ switchMode, closeModal }: any) => {
  const { addToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await AuthService.signup({ fullName, email, password });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Signup failed.");

      addToast({
        message: "Account created! Please verify your email to continue 📩",
        type: "success",
      });

      switchMode("login");
      closeModal();
    } catch (err: any) {
      console.error("❌ Signup Error:", err.message);
      const errorMsg = /email/i.test(err.message)
        ? "Invalid or already registered email address."
        : err.message || "Unable to create account.";
      setError(errorMsg);
      addToast({ message: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Join SafarNama</h2>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}

      <SocialLoginButtons />
      <Separator />

      <form onSubmit={handleSubmit} className="space-y-4" >
        <InputWithIcon Icon={User} type="text" placeholder="Full Name" value={fullName} onChange={(e: any) => setFullName(e.target.value)} required />
        <InputWithIcon Icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <InputWithIcon Icon={Lock} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e: any) => setPassword(e.target.value)} required />

        {error && <ErrorBox message={error} />}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button onClick={() => switchMode("login")} className="font-semibold text-green-600 hover:underline">
          Log In
        </button>
      </p>
    </div>
  );
};

/* ------------------- Forgot Form ------------------- */

export const ForgotPasswordForm = ({ switchMode }: any) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await AuthService.forgotPassword({ email });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "If the email exists, you will receive a reset link."
        );
      }

      addToast({
        message: "If the email exists, a reset link has been sent 📩",
        type: "success",
      });

      switchMode("login");
    } catch (err: any) {
      setError(err.message);
      addToast({ message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        Forgot Password
      </h2>

      <p className="text-sm text-gray-600 text-center">
        Enter your email and we’ll send you a password reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon
          Icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          required
        />

        {error && <ErrorBox message={error} />}

        <motion.button
          type="submit"
          disabled={isLoading || !email}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Remembered your password?{" "}
        <button
          onClick={() => switchMode("login")}
          className="font-semibold text-green-600 hover:underline"
        >
          Back to Login
        </button>
      </p>
    </div>
  );
};


/* ------------------- Reusable UI ------------------- */

export const InputWithIcon = ({
    Icon,
    type,
    showForgot,
    ...props
  }: {
    Icon: LucideIcon;
    type: string;
    [key: string]: any;
    showForgot?: boolean;
  }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const toggleVisibility = () => setIsPasswordVisible((prev) => !prev);
  const { switchMode } = useAuthModal();

  const finalType =
    type === "password" ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>

      <input
        {...props}
        type={finalType}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-1 focus:ring-green-500"
      />

      {type === "password" && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center
                     text-gray-400 hover:text-gray-600"
        >
          {isPasswordVisible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
      {showForgot && (
        <button
          type="button"
          onClick={() => switchMode("forgot")}
          className="text-xs text-emerald-600 hover:underline text-right w-full"
        >
          Forgot password?
        </button>
      )}
    </div>
  );
};

export const ErrorBox = ({ message }: { message: string }) => (
  <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">{message}</div>
);