import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db";
import { BalanceCard } from "../../../components/BalanceCard";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findUnique({
        where: { userId: Number(session?.user?.id) }
    });
    return { amount: balance?.amount || 0, locked: balance?.locked || 0 };
}

export default async function Dashboard() {
    const balance = await getBalance();

    return (
        <div className="w-full max-w-6xl mx-auto relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] ambient-glow opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-1000 -z-10"></div>
            <h1 className="text-4xl text-[#0B0B0B] dark:text-zinc-200 pt-8 mb-8 font-extrabold tracking-tight">
                Account <span className="text-[#00B4D8]">Overview</span>
            </h1>
            <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mb-8 transition-colors">
                <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-200">Welcome back!</h2>
                <p className="text-gray-500 dark:text-zinc-400 mt-2">
                    Your AssurePay dashboard is active. Navigate to the <b>Transfer</b> tab in the sidebar to add funds via Razorpay or withdraw to your bank.
                </p>
            </div>
             <div>
                <BalanceCard amount={balance.amount} locked={balance.locked} />
            </div>
        </div>
    );
}