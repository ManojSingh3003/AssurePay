import { Card } from "@repo/ui";

export const BalanceCard = ({ amount, locked }: { amount: number; locked: number }) => {
    return (
        <Card title="Wallet Balance">
            <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mt-4 text-gray-700 dark:text-zinc-300 transition-colors">
                <div className="font-medium">Available Balance</div>
                <div className="font-bold">₹{(amount / 100).toFixed(2)}</div>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 py-4 text-gray-500 dark:text-zinc-500 transition-colors">
                <div>Locked (Processing)</div>
                <div>₹{(locked / 100).toFixed(2)}</div>
            </div>
            <div className="flex justify-between pt-4 text-[#0B0B0B] dark:text-zinc-200 transition-colors">
                <div className="font-bold">Total Balance</div>
                <div className="font-extrabold">₹{((amount + locked) / 100).toFixed(2)}</div>
            </div>
        </Card>
    );
};