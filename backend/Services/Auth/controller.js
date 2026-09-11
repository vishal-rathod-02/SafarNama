import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./model.js";
import crypto from "crypto";
import { sendEmail } from "../../Utils/mailer.js";

/* -------------------- HELPERS & VALIDATION -------------------- */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendResponse = (res, status, success, message, data = null) =>
  res.status(status).json({ success, message, data });

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  CLIENT_URL = "http://localhost:5173",
  NODE_ENV,
} = process.env;

/* -------------------- TOKEN UTILS -------------------- */
const signAccessToken = (userId) =>
  jwt.sign({ user: { id: userId } }, JWT_SECRET, { expiresIn: "15m" });

const signRefreshToken = (user) =>
  jwt.sign(
    { user: { id: user.id, v: user.refreshTokenVersion } },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/* ======================================================
   🟢 SIGNUP (Email verification required)
====================================================== */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return sendResponse(res, 400, false, "All fields (Full Name, Email, and Password) are required");
    }

    const cleanName = fullName.trim().slice(0, 80);
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return sendResponse(res, 400, false, "Full name must be at least 2 characters");
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return sendResponse(res, 400, false, "Please provide a valid email address");
    }

    if (typeof password !== "string" || password.length < 6) {
      return sendResponse(res, 400, false, "Password must be at least 6 characters");
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return sendResponse(res, 400, false, "An account with this email is already registered");
    }

    const emailVerifyToken = jwt.sign(
      { email: cleanEmail },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    await User.create({
      fullName: cleanName,
      email: cleanEmail,
      password: await bcrypt.hash(password, 10),
      isEmailVerified: false,
      emailVerifyToken,
      refreshTokenVersion: 0,
    });

    const verifyURL = `${CLIENT_URL}/verify-email/${emailVerifyToken}`;

    await sendEmail({
      to: cleanEmail,
      subject: "Verify your SafarNama account",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px">
          <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
            <h2 style="color:#f59e0b;margin-bottom:8px">Welcome to SafarNama 🚗</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6">
              Thank you for signing up! Please verify your email to activate your account and start planning memorable journeys.
            </p>
            <div style="margin:24px 0;">
              <a href="${verifyURL}"
                style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#020617;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                Verify My Email
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px">This verification link will expire in 24 hours.</p>
          </div>
        </div>
      `,
    });

    sendResponse(
      res,
      201,
      true,
      "Signup successful! Please check your inbox to verify your email."
    );
  } catch (err) {
    console.error("Signup Error:", err.message);
    sendResponse(res, 500, false, "Signup failed. Please try again.");
  }
};

/* ======================================================
   ✉️ VERIFY EMAIL
====================================================== */
export const verifyEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, JWT_SECRET);

    const user = await User.findOne({
      email: decoded.email,
      emailVerifyToken: req.params.token,
    });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid or expired verification link");
    }

    if (user.isEmailVerified) {
      return sendResponse(res, 200, true, "Email is already verified");
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    await user.save();

    return sendResponse(res, 200, true, "Email verified successfully");
  } catch (err) {
    return sendResponse(res, 400, false, "Verification link expired or invalid");
  }
};

/* ======================================================
   🔁 RESEND EMAIL VERIFICATION
====================================================== */
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: "A valid email address is required",
    });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: "If an unverified account exists with this email, a verification link has been resent.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified. You can log in directly.",
      });
    }

    // Generate new token
    const emailVerifyToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.emailVerifyToken = emailVerifyToken;
    await user.save();

    const verifyURL = `${CLIENT_URL}/verify-email/${emailVerifyToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your SafarNama account",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px">
          <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
            <h2 style="color:#f59e0b;margin-bottom:8px">Verify your email</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6">Please click the button below to verify your account.</p>
            <div style="margin:24px 0;">
              <a href="${verifyURL}"
                style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#020617;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                Verify Email
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px">This link will expire in 24 hours.</p>
          </div>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Verification email resent successfully. Please check your inbox.",
    });
  } catch (err) {
    console.error("Resend Verification Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
};

/* ======================================================
   🟢 LOGIN (User Enumeration Fixed)
====================================================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // 🔒 Uniform error prevents account enumeration
    if (!user) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
      return sendResponse(res, 403, false, "Please verify your email before logging in. You can use 'Resend Verification' if needed.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    sendResponse(res, 200, true, "Login successful", { token: accessToken, user });
  } catch (err) {
    console.error("Login Error:", err.message);
    sendResponse(res, 500, false, "Something went wrong. Please try again later.");
  }
};

/* ======================================================
   🔁 REFRESH TOKEN
====================================================== */
export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || decoded.user.v !== user.refreshTokenVersion) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ success: false, message: "Session expired or revoked" });
    }

    const accessToken = signAccessToken(user.id);
    sendResponse(res, 200, true, "Token refreshed", { token: accessToken });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(401).json({ success: false, message: "Invalid refresh token" });    
  }
};

/* ======================================================
   🚪 LOGOUT (Single Device)
====================================================== */
export const logout = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
  });
  sendResponse(res, 200, true, "Logged out successfully");
};

/* ======================================================
   📩 FORGOT PASSWORD
====================================================== */
const PASSWORD_RESET_EMAIL_TEMPLATE = (resetURL) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:32px">
    <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.05)">
      <h2 style="color:#f59e0b;margin-bottom:8px">Reset your SafarNama password</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6">
        We received a request to reset your password. Click the button below to set a new password.
      </p>

      <div style="margin:24px 0;">
        <a href="${resetURL}"
          style="
            display:inline-block;
            padding:12px 24px;
            background:#f59e0b;
            color:#020617;
            border-radius:10px;
            text-decoration:none;
            font-weight:700;
            font-size:14px;
          ">
          Reset Password
        </a>
      </div>

      <p style="color:#94a3b8;font-size:12px">
        This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0" />

      <p style="font-size:12px;color:#94a3b8">
        © ${new Date().getFullYear()} SafarNama • Travel Smarter
      </p>
    </div>
  </div>
`;

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
    return sendResponse(res, 400, false, "A valid email address is required");
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // 🔒 Always return identical response (neutralize email enumeration)
    if (!user) {
      return sendResponse(res, 200, true, "If the email exists in our system, a password reset link has been sent.");
    }

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token for database storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min expiration
    await user.save();

    const resetURL = `${CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your SafarNama password",
      html: PASSWORD_RESET_EMAIL_TEMPLATE(resetURL),
    });

    sendResponse(res, 200, true, "Password reset link sent! Please check your inbox.");
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    sendResponse(res, 500, false, "Unable to process request");
  }
};

/* ======================================================
   🔑 RESET PASSWORD
====================================================== */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return sendResponse(res, 400, false, "New password must be at least 6 characters");
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid or expired reset link. Please request a new one.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenVersion += 1;

    await user.save();

    sendResponse(res, 200, true, "Password reset successful! You can now log in with your new password.");
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    sendResponse(res, 400, false, "Reset failed");
  }
};

/* ======================================================
   🚪 LOGOUT ALL DEVICES
====================================================== */
export const logoutAllDevices = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { refreshTokenVersion: 1 },
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
  });
  sendResponse(res, 200, true, "Logged out from all devices successfully");
};

/* ======================================================
   👤 GET USER
====================================================== */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return sendResponse(res, 404, false, "User not found");

    sendResponse(res, 200, true, "User fetched", user);
  } catch {
    sendResponse(res, 500, false, "Fetch user failed");
  }
};