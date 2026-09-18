"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type PrimaryButtonProps = HTMLMotionProps<"button"> & {
  wiggle?: boolean;
};

export function PrimaryButton({
  children,
  className = "",
  disabled,
  wiggle = false,
  ...props
}: PrimaryButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : wiggle ? { scale: 1.02 } : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 px-6 py-3.5 text-base font-extrabold text-white shadow-xl shadow-pink-500/25 transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
