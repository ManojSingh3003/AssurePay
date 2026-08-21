import { Card } from "@repo/ui";

import { RefreshPendingButton } from "./RefreshPendingButton";

export const TransactionsList = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        status: string,
        provider?: string,
        details?: string,
        type: "Deposit" | "Withdrawal" | "P2P_Sent" | "P2P_Received" | "Merchant_Payment"
    }[]
}) => {
    if (!transactions.length) {
        return (
            <Card className="relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0B0B0B] dark:text-zinc-200 tracking-tight transition-colors">Recent Transactions</h2>
                    <RefreshPendingButton />
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-zinc-500 opacity-80 transition-colors">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">No transactions yet</p>
                    <p className="text-sm mt-1 max-w-[200px] mx-auto">When you send or receive money, it will show up here.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="relative">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-[#0B0B0B] dark:text-zinc-200 tracking-tight transition-colors">Recent Transactions</h2>
                {transactions.some(t => t.status === "Processing") && (
                    <RefreshPendingButton />
                )}
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {transactions.map((t, index) => {
                    const isPositive = t.type === "Deposit" || t.type === "P2P_Received";
                    
                    return (
                        <div key={index} className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4 last:border-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 p-2 -mx-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-zinc-800/50 text-gray-600 dark:text-zinc-400'}`}>
                                    {isPositive ? '+' : '-'}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-[#0B0B0B] dark:text-zinc-200">
                                        {t.type === "Deposit" ? "Added INR" : 
                                         t.type === "Withdrawal" ? "Withdrawn INR" : 
                                         t.type === "P2P_Sent" ? "Sent INR (P2P)" : 
                                         t.type === "Merchant_Payment" ? "Paid Merchant" : 
                                         "Received INR (P2P)"}
                                    </div>
                                    {t.details && (
                                        <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                                            {t.details}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-medium">
                                        {new Intl.DateTimeFormat('en-US', {
                                            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                                        }).format(new Date(t.time))}
                                    </div>
                                    <div className="mt-1.5">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            t.status === "Success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : 
                                            t.status === "Failure" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : 
                                            "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                                t.status === "Success" ? "bg-green-500" : 
                                                t.status === "Failure" ? "bg-red-500" : 
                                                "bg-yellow-500"
                                            }`}></span>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={`flex flex-col justify-center text-lg font-bold transition-colors ${
                                isPositive ? "text-green-600 dark:text-green-400" : "text-[#0B0B0B] dark:text-zinc-200"
                            }`}>
                                {isPositive ? "+" : "-"} ₹{(t.amount / 100).toFixed(2)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}