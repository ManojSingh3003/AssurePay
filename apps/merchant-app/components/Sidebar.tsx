"use client";

import { Sidebar as SharedSidebar } from "@repo/ui";
import { LayoutDashboard, LineChart, ListOrdered, Settings } from "lucide-react";

export function Sidebar() {

    const NAV_ITEMS = [
        { label: "Overview", href: "/", icon: <LayoutDashboard size={24} /> },
        { label: "Analytics", href: "/analytics", icon: <LineChart size={24} /> },
        { label: "Transactions", href: "/transactions", icon: <ListOrdered size={24} /> },
        { label: "Profile", href: "/profile", icon: <Settings size={24} /> },
    ];

    // TODO 2: Return the SharedSidebar component and pass NAV_ITEMS as the `items` prop
    return (
        <div className="h-full">
            <SharedSidebar items={NAV_ITEMS} />
        </div>
    );
}
