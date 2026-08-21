"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button = ({ children, onClick, variant = "primary", className = "", disabled, type = "button" }: ButtonProps) => {
  const baseStyles = "w-full py-3 px-6 rounded-full font-bold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  
  const variants = {
    primary: "bg-zinc-900 dark:bg-[#00B4D8] text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-[#33C4E3] focus:ring-zinc-900 dark:focus:ring-[#00B4D8] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_20px_rgba(0,180,216,0.4)] border border-transparent font-bold tracking-wide",
    secondary: "bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:ring-zinc-900 dark:focus:ring-zinc-600 backdrop-blur-md",
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};