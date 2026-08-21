import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db";
import { TransactionsList } from "../../../components/TransactionsList";

async function getTransactionHistory() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    const userId = Number(session.user.id);

    // Fetch all types of transactions concurrently
    const [onRampTxns, offRampTxns, p2pSentTxns, p2pReceivedTxns, merchantTxns] = await Promise.all([
        prisma.onRampTransaction.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' }
        }),
        prisma.offRampTransaction.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' }
        }),
        prisma.p2pTransfer.findMany({
            where: { fromUserId: userId },
            include: { toUser: true },
            orderBy: { timestamp: 'desc' }
        }),
        prisma.p2pTransfer.findMany({
            where: { toUserId: userId },
            include: { fromUser: true },
            orderBy: { timestamp: 'desc' }
        }),
        prisma.merchantTransfer.findMany({
            where: { fromUserId: userId },
            include: { toMerchant: true },
            orderBy: { timestamp: 'desc' }
        })
    ]);

    // Format and combine the arrays
    const combinedTransactions = [
        ...onRampTxns.map(t => ({
            time: t.startTime,
            amount: t.amount,
            status: t.status,
            provider: t.provider,
            type: "Deposit" as const,
            details: `via ${t.provider}`
        })),
        ...offRampTxns.map(t => ({
            time: t.startTime,
            amount: t.amount,
            status: t.status,
            type: "Withdrawal" as const,
            details: "To Bank Account"
        })),
        ...p2pSentTxns.map(t => ({
            time: t.timestamp,
            amount: t.amount,
            status: "Success",
            type: "P2P_Sent" as const,
            details: `To ${t.toUser?.name || t.toUser?.number || "Unknown"}`
        })),
        ...p2pReceivedTxns.map(t => ({
            time: t.timestamp,
            amount: t.amount,
            status: "Success",
            type: "P2P_Received" as const,
            details: `From ${t.fromUser?.name || t.fromUser?.number || "Unknown"}`
        })),
        ...merchantTxns.map(t => ({
            time: t.timestamp,
            amount: t.amount,
            status: "Success",
            type: "Merchant_Payment" as const,
            details: `To ${t.toMerchant?.name || t.toMerchant?.merchantCode || "Merchant"}`
        }))
    ];

    // Sort combined array by exact time, descending
    return combinedTransactions.sort((a, b) => b.time.getTime() - a.time.getTime());
}

export default async function TransactionsPage() {
    const transactions = await getTransactionHistory();

    return (
        <div className="w-full max-w-6xl mx-auto relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] ambient-glow opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-1000 -z-10"></div>
            <h1 className="text-4xl text-[#0B0B0B] dark:text-zinc-200 pt-8 mb-8 font-extrabold tracking-tight transition-colors">
                Transaction <span className="text-[#00B4D8]">History</span>
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-8">
                    <TransactionsList transactions={transactions} />
                </div>
            </div>
        </div>
    );
}