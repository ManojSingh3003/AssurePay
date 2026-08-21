"use client";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string; // Allows you to pass custom margins/colors if needed
}

export const Loader = ({ size = "md", className = "" }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      {/* Changes: 
        1. Added border-b-[#0B0B0B] for a dual-color spin using your brand colors.
        2. Added a subtle drop-shadow for depth.
      */}
      <div 
        className={`${sizeClasses[size]} rounded-full border-gray-200 border-t-[#00B4D8] border-b-[#0B0B0B] animate-spin drop-shadow-sm`}
      ></div>
    </div>
  );
};