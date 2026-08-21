import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { redirect } from "next/navigation";

type Transaction = {
  id: number;
  amount: number;
  timestamp: Date;
  fromUser?: {
    name: string | null;
    number: string;
  } | null;
};

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const transactions = await prisma.merchantTransfer.findMany({
        where: {
            toMerchantId: Number(session.user.id)
        },
        include: {
            fromUser: true
        },
        orderBy: {
            timestamp: "desc"
        }
    });

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction Ledger</h1>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                <th className="p-4 font-bold">Transaction ID</th>
                                <th className="p-4 font-bold">Date & Time</th>
                                <th className="p-4 font-bold">Customer Phone</th>
                                <th className="p-4 font-bold text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">

                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                            
                            {transactions.map((tx: Transaction) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-mono text-gray-500">#{tx.id}</td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {/* Format the date however you like! */}
                                        {new Date(tx.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-900">
                                        {/* Display the sender's phone number here */}
                                        <div className="flex flex-col">
                                            <span>{tx.fromUser?.name || "Unknown Customer"}</span>
                                            <span className="text-xs text-gray-500">{tx.fromUser?.number}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-extrabold text-green-600 text-right">
                                        +₹{(tx.amount / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
