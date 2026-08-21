import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { AppbarClient } from "../../components/AppbarClient";
import { DashboardSidebar } from "../../components/DashboardSidebar";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const sess = await getServerSession(authOptions);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppbarClient user={sess?.user} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 p-8 pb-24 md:pb-8 bg-transparent overflow-y-auto relative z-10 transition-colors">
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}