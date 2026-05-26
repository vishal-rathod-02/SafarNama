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
  resendVerificationEmail
} from "./controller.js";

import authMiddleware from "../../Middleware/Auth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, getUser);
router.post("/logout-all", authMiddleware, logoutAllDevices);

/* ================= EMAIL ================= */
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

/* ================= PASSWORD ================= */
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
