import "../Config/env.js";
import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "NO_TOKEN",
      message: "Access token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
    });
  }
}
