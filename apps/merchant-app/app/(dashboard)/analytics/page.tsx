import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { RevenueChart } from "../../../components/RevenueChart";
import { format, subDays } from "date-fns";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const rawTransfers = await prisma.merchantTransfer.findMany({
        where: {
            toMerchantId: Number(session.user.id),
            timestamp: {
                gte: subDays(new Date(), 7),
            }
        },
        orderBy: {
            timestamp: "asc"
        }
    });

    
    const chartData: { date: string, amount: number }[] = Object.values(
        rawTransfers.reduce((acc, tx) => {
            const date = format(tx.timestamp, "MMM dd");
            if (!acc[date]) {
                acc[date] = { date, amount: 0 };
            }
            acc[date].amount += tx.amount / 100;
            return acc;
        }, {} as Record<string, { date: string, amount: number }>)
    );

    const totalRevenue = rawTransfers.reduce((sum, tx) => sum + tx.amount / 100, 0);
    const totalTransactions = rawTransfers.length;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</p>
                    <p className="text-4xl font-extrabold text-[#0B0B0B]">₹{totalRevenue.toFixed(2)}</p>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Transactions</p>
                    <p className="text-4xl font-extrabold text-[#00B4D8]">{totalTransactions}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Over Time</h2>
                {/* The Chart Component */}
                <RevenueChart data={chartData} />
            </div>
        </div>
    );
}
