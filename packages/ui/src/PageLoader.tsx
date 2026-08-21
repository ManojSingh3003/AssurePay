import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface PageLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const PageLoader = ({ isLoading, message = "LOADING" }: PageLoaderProps) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-[#050505]/90 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="uiverse-loader text-[#0B0B0B] dark:text-gray-100">
              <span className="uiverse-loader-text">{message}</span>
              <span className="uiverse-load"></span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
