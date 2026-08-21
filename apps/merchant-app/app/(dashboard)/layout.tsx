import { Sidebar } from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* The Sidebar navigation for merchants */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
            {children}
        </div>
    </div>
  );
}
