import { useEffect, useState } from "react";
import { useToast } from "../Shared/ToastContext";
import { useAuth } from "./AuthContext";
import { AuthService } from "@/Services/Auth/Auth.service";
import { Lock, Mail, User, Eye, EyeOff, LucideIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleIcon } from "../Shared/icons";
import { useAuthModal } from "./AuthModalContext";

const Separator = () => (
  <div className="flex items-center space-x-2 my-2">
    <hr className="grow border-slate-200 dark:border-slate-700" />
    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">OR</span>
    <hr className="grow border-slate-200 dark:border-slate-700" />
  </div>
);

const SocialLoginButtons = () => {
  const { addToast } = useToast();
  return (
    <button
      className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition duration-200 shadow-xs text-slate-700 dark:text-slate-200 font-semibold"
      onClick={() => addToast({ message: "Google Sign-In coming soon!", type: "info" })}
    >
      <GoogleIcon className="w-5 h-5" />
      <span>Continue with Google</span>
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
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Welcome Back
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Sign In to SafarNama
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Continue planning your dream adventures
        </p>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center rounded-xl z-50">
          <div className="animate-spin h-9 w-9 border-3 border-amber-500 border-t-transparent rounded-full" />
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

        <InputWithIcon 
          Icon={Lock} 
          type="password" 
          placeholder="Password (min 6 chars)" 
          value={password} 
          onChange={(e: any) => setPassword(e.target.value)} 
          required  
          showForgot
        />

        {error && <ErrorBox message={error} />}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 transition disabled:opacity-50 tracking-wide"
        >
          {isLoading ? "Logging you in..." : "Login to SafarNama"}
        </motion.button>
      </form>

      {/* Resend Verification */}
      {showResend && (
        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="w-full text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
        >
          {cooldown > 0
            ? `Resend available in ${cooldown}s`
            : isResending
            ? "Sending verification email..."
            : "Resend verification email"}
        </button>
      )}

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Don’t have an account?{" "}
        <button
          onClick={() => switchMode("signup")}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
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
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Start Exploring
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Join SafarNama</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Create an account to save custom itineraries and routes
        </p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl z-50">
          <div className="animate-spin rounded-full h-9 w-9 border-3 border-amber-500 border-t-transparent"></div>
        </div>
      )}

      <SocialLoginButtons />
      <Separator />

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputWithIcon Icon={User} type="text" placeholder="Full Name" value={fullName} onChange={(e: any) => setFullName(e.target.value)} required />
        <InputWithIcon Icon={Mail} type="email" placeholder="Email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <InputWithIcon Icon={Lock} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e: any) => setPassword(e.target.value)} required />

        {error && <ErrorBox message={error} />}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          className="w-full bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 tracking-wide"
        >
          {isLoading ? "Creating Account..." : "Create Free Account"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <button onClick={() => switchMode("login")} className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
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
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Forgot Password
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we’ll send you a password reset link.
        </p>
      </div>

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
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          className="w-full bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 tracking-wide"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Remembered your password?{" "}
        <button
          onClick={() => switchMode("login")}
          className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
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
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>

      <input
        {...props}
        type={finalType}
        className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl
                   text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
                   focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150"
      />

      {type === "password" && (
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center
                     text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline text-right w-full mt-1.5"
        >
          Forgot password?
        </button>
      )}
    </div>
  );
};

export const ErrorBox = ({ message }: { message: string }) => (
  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 px-3.5 py-2.5 rounded-xl text-sm font-medium">{message}</div>
);