import React, { useState } from 'react';
import { motion } from "framer-motion";
import { CompassOffIcon,AlertTriangleIcon } from "./icons";
import type {ErrorMessageProps } from '@/hooks/types';


const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
} as any;

const childVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
} as any;
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = "generic", // "route" | "auth" | "generic"
  onPrimaryAction,

}) => {
  const isRouteError = variant === "route";
  const isAuthError = variant === "auth";

  const title = isAuthError
    ? "Sign in to Continue Your Journey"
    : isRouteError
    ? "We Couldn't Plan That Route"
    : "Something Went Wrong";

  const subtitle = isAuthError
    ? "You need to be logged in to generate and save trips with SafarNama."
    : isRouteError
    ? "We couldn’t find a valid travel path for the selected locations. Try adjusting your source or destination."
    : "An unexpected error occurred while processing your request.";

  const buttonLabel = isAuthError
    ? "Login/Signup to Plan"
    : isRouteError
    ? "Try Another Route"
    : "Try Again";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg w-full mx-auto bg-white border border-gray-200/70 rounded-2xl p-6 text-center shadow-lg mt-20"
      role="alert"
    >
      {/* Icon */}
      <motion.div variants={childVariants}>
        {isAuthError ? (
          <AlertTriangleIcon className="w-14 h-14 text-red-500 mx-auto mb-3" />
        ) : (
          <CompassOffIcon className="w-14 h-14 text-green-600 mx-auto mb-3" />
        )}
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={childVariants}
        className="text-2xl font-extrabold text-slate-800 mb-2"
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        variants={childVariants}
        className="text-slate-600 text-sm mb-4"
      >
        {subtitle}
      </motion.p>

      {/* Backend message */}
      <motion.div
        variants={childVariants}
        className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl p-3 mx-auto"
      >
        {message}
      </motion.div>

      {/* Primary CTA */}
      {onPrimaryAction && (
        <motion.div variants={childVariants} className="mt-5">
          <button
            onClick={onPrimaryAction}
            className="px-5 py-2.5 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition"
          >
            {buttonLabel}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};