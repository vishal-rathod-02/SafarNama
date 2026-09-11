import express from "express";
import {
  signup,
  login,
  refreshToken,
  getUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  logoutAllDevices,
  resendVerificationEmail,
  logout,
} from "./controller.js";

import authMiddleware from "../../Middleware/Auth.js";
import { authRateLimiter, emailActionRateLimiter } from "../../Middleware/rateLimiter.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authMiddleware, getUser);
router.post("/logout-all", authMiddleware, logoutAllDevices);

/* ================= EMAIL ================= */
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", emailActionRateLimiter, resendVerificationEmail);

/* ================= PASSWORD ================= */
router.post("/forgot-password", emailActionRateLimiter, requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
