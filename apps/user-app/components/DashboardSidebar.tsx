"use client";

import { Sidebar } from "@repo/ui";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUnreadNotificationCount } from "../lib/actions/notifications";

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count whenever the pathname changes
    const fetchUnread = async () => {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    };
    
    fetchUnread();
  }, [pathname]);

  const navs = [
    { 
      href: "/dashboard", 
      label: "Home",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
    },
    { 
      href: "/transfer", 
      label: "Transfer",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
    },
    { 
      href: "/transactions", 
      label: "Transactions",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
    },
    { 
      href: "/profile", 
      label: "Profile",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
      hasUnread: unreadCount > 0
    }
  ];

  const router = useRouter();

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar items={navs} />

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex justify-around items-center px-2 py-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navs.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1 p-2 relative w-16"
            >
              <div className={`transition-colors duration-200 ${isActive ? 'text-[#00B4D8]' : 'text-gray-400'}`}>
                {item.icon && (
                  <div className="relative">
                    {item.icon}
                    {item.hasUnread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors duration-200 ${isActive ? 'text-[#0B0B0B]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
