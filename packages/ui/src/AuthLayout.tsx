"use client";

import { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: The Form Canvas */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-24">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Side: The Theme Splash */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#00B4D8] rounded-l-[3rem] relative items-center justify-center overflow-hidden shadow-2xl">
        <div className="text-white text-center p-12 z-10">
          <h1 className="text-6xl font-extrabold mb-4 tracking-tight">AssurePay</h1>
          <p className="text-xl font-medium text-cyan-50">Minimalist Neo-Banking.</p>
        </div>
        
        {/* Organic Decorative Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};