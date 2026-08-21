import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { SendMoneyCard } from "../../../components/SendMoneyCard";
import { TransferActionModals } from "../../../components/TransferActionModals";
import { RecentPayees } from "../../../components/RecentPayees";


export default async function TransferPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-transparent p-6 lg:p-8 transition-colors relative">
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] ambient-glow opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-1000 -z-10"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <h1 className="text-4xl text-[#0B0B0B] dark:text-zinc-200 mb-8 font-extrabold tracking-tight transition-colors">
                    Transfer <span className="text-[#00B4D8]">Funds</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Quick Actions */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
                            <h2 className="text-lg font-bold text-[#0B0B0B] dark:text-zinc-200 mb-4 transition-colors">Quick Actions</h2>
                            <TransferActionModals userPhone={session?.user?.email || ""} />
                        </div>
                    </div>

                    {/* Right Column: Send Money & History */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <SendMoneyCard />
                        {session?.user?.id && <RecentPayees userId={Number(session.user.id)} />}
                    </div>
                </div>
            </div>
        </div>
    );
}