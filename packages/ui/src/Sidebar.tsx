"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode; 
  hasUnread?: boolean;
}

export const Sidebar = ({ items }: { items: SidebarItem[] }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`${isCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out bg-white dark:bg-zinc-950/50 backdrop-blur-md border-r border-gray-100 dark:border-zinc-800 py-6 px-4 hidden md:flex flex-col h-full overflow-y-auto z-40 relative`}
    >
      {/* Top Left Toggle Button */}
      <div className={`flex items-center mb-6 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-start px-2'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`relative w-10 h-10 cursor-pointer flex items-center justify-center transition-transform duration-500 ${!isCollapsed ? 'rotate-180' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <div className={`absolute h-1 bg-[#00B4D8] rounded-full transition-all duration-500 ${!isCollapsed ? 'w-[70%] rotate-45' : 'w-[70%] -translate-y-[10px]'}`}></div>
          <div className={`absolute h-1 bg-[#00B4D8] rounded-full transition-all duration-500 ${!isCollapsed ? 'scale-x-0 opacity-0' : 'w-full opacity-100'}`}></div>
          <div className={`absolute h-1 bg-[#00B4D8] rounded-full transition-all duration-500 ${!isCollapsed ? 'w-[70%] -rotate-45' : 'w-[70%] translate-y-[10px]'}`}></div>
        </button>
      </div>

      <div className="grow space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div 
              key={item.href} 
              onClick={() => router.push(item.href)}
              className={`cursor-pointer flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-200 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive 
                  ? "bg-[#00B4D8]/10 text-[#00B4D8] shadow-sm dark:shadow-[0_0_15px_rgba(0,180,216,0.15)] dark:border dark:border-[#00B4D8]/20" 
                  : "text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-[#0B0B0B] dark:hover:text-zinc-200 border border-transparent"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon && (
                <div className="relative">
                  {item.icon}
                  {item.hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </div>
              )}
              {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </div>
          );
        })}
      </div>

    </aside>
  );
};