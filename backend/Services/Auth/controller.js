import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "./model.js";
import crypto from "crypto";


/* -------------------- HELPERS -------------------- */
const sendResponse = (res, status, success, message, data = null) =>
  res.status(status).json({ success, message, data });

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_RESET_SECRET,
  CLIENT_URL = "http://localhost:5173",
  SMTP_EMAIL,
  SMTP_PASS,
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
    if (!fullName || !email || !password)
      return sendResponse(res, 400, false, "All fields are required");

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return sendResponse(res, 400, false, "Email already registered");

    const emailVerifyToken = jwt.sign(
      { email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    await User.create({
      fullName,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      isEmailVerified: false,
      emailVerifyToken,
      refreshTokenVersion: 0,
    });

    const verifyURL = `${CLIENT_URL}/verify-email/${emailVerifyToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_EMAIL, pass: SMTP_PASS },
    });

   await transporter.sendMail({
        to: email,
        subject: "Verify your SafarNama account",
        html: `
          <h2>Welcome to SafarNama </h2>
          <p>Please verify your email to activate your account.</p>
          <a href="${verifyURL}"
            style="padding:10px 16px;background:#16a34a;color:white;border-radius:6px;text-decoration:none;">
            Verify Email
          </a>
          <p>This link expires in 24 hours.</p>
        `,
      });

    sendResponse(
      res,
      201,
      true,
      "Signup successful. Please verify your email."
    );
  } catch (err) {
    console.error("Signup Error:", err.message);
    sendResponse(res, 500, false, "Signup failed");
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

  if (!email)
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    if (user.isEmailVerified)
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });

    // Generate new token
    const emailVerifyToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.emailVerifyToken = emailVerifyToken;
    await user.save();

    const verifyURL = `${CLIENT_URL}/verify-email/${emailVerifyToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Verify your SafarNama account",
      html: `
        <h2>Verify your email</h2>
        <p>Please click the button below to verify your account.</p>
        <a href="${verifyURL}"
          style="padding:10px 16px;background:#16a34a;color:white;
          border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.json({
      success: true,
      message: "Verification email resent successfully",
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
   🟢 LOGIN
====================================================== */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendResponse(res, 400, false, "Invalid email, try with different email");

    if (!user.isEmailVerified)
      return sendResponse(res, 403, false, "Please verify your email");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return sendResponse(res, 400, false, "Invalid Password ");

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user);

    setRefreshCookie(res, refreshToken);

    sendResponse(res, 200, true, "Login successful", { token: accessToken });
  } catch (err) {
    console.error("Login Error:", err.message);
    sendResponse(res, 500, false, "Something went wrong. Please try again later");
  }
};

/* ======================================================
   🔁 REFRESH TOKEN
====================================================== */
export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false });

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.user.id);

    if (!user || decoded.user.v !== user.refreshTokenVersion)
      return res.status(401).json({ success: false });

    const accessToken = signAccessToken(user.id);
    sendResponse(res, 200, true, "Token refreshed", { token: accessToken });
  } catch {
    res.clearCookie("refreshToken");
      return res.status(401).json({ success: false });    
  }
};

/* ======================================================
📩 FORGOT PASSWORD
====================================================== */

  const PASSWORD_RESET_EMAIL_TEMPLATE = (resetURL) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f9fafb;padding:32px">
    <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:12px;padding:32px">
      <h2 style="color:#16a34a;margin-bottom:8px">Reset your SafarNama password</h2>
      <p style="color:#4b5563;font-size:14px">
        We received a request to reset your password. Click the button below to continue.
      </p>

      <a href="${resetURL}"
        style="
          display:inline-block;
          margin-top:20px;
          padding:12px 20px;
          background:#16a34a;
          color:white;
          border-radius:8px;
          text-decoration:none;
          font-weight:600;
        ">
        Reset Password
      </a>

      <p style="margin-top:20px;color:#6b7280;font-size:12px">
        This link will expire in 15 minutes.
        If you didn’t request this, you can safely ignore this email.
      </p>

      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />

      <p style="font-size:12px;color:#9ca3af">
        © ${new Date().getFullYear()} SafarNama • Travel Smarter
      </p>
    </div>
  </div>
`;

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return same response (no email enumeration)
    if (!user) {
      return sendResponse(res, 200, true, "If the email exists, a reset link has been sent");
    }

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token for DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetURL = `${CLIENT_URL}/reset-password/${rawToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_EMAIL, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Reset your SafarNama password",
      html: PASSWORD_RESET_EMAIL_TEMPLATE(resetURL),
    });

    sendResponse(res, 200, true, "Password reset link sent");
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
    if (!newPassword || newPassword.length < 6) {
      return sendResponse(res, 400, false, "Password must be at least 6 characters");
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
      return sendResponse(res, 400, false, "Invalid or expired reset link");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenVersion += 1;

    await user.save();

    sendResponse(res, 200, true, "Password reset successful");
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

  res.clearCookie("refreshToken");
  sendResponse(res, 200, true, "Logged out from all devices");
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