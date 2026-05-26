import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* 🔐 EMAIL VERIFICATION */
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: {
      type: String,
      default: null,
    },

    /* 🔁 REFRESH TOKEN SECURITY */
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },

    /* 🔑 PASSWORD RESET */
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* 🔒 Remove sensitive fields from API responses */
UserSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.refreshTokenVersion;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerifyToken;
    return ret;
  },
});

export default mongoose.model("User", UserSchema);
