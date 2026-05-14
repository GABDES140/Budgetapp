"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type PageTransitionProps = Readonly<{
  children: ReactNode;
}>;

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
