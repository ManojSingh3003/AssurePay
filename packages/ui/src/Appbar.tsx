"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export interface AppbarProps {
  user?: {
    id: string;
    isProfileComplete?: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => Promise<void> | void; 
}


export const Appbar = ({ user, onSignOut }: AppbarProps) => { 
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-zinc-950/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-gray-100 dark:border-zinc-800 transition-colors">
      <div className="text-2xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-200">
        Assure<span className="text-[#00B4D8]">Pay</span>
      </div>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-400"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900/50 py-2 px-4 rounded-full border border-gray-200 dark:border-zinc-800 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_15px_rgba(0,0,0,0.2)]">
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-white/10 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center font-bold text-sm shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:block">
              Hi, {user.name || "User"}
            </span>
            <button 
              onClick={onSignOut}
              className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse"></div>
        )}
      </div>
    </nav>
  );
};