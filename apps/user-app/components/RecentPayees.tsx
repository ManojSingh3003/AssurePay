import {prisma} from "@repo/db";
import Link from "next/link";

async function getRecentPayees(userId: number) {
    // Fetch recent messages involving this user
    const recentMessages = await prisma.p2pMessage.findMany({
        where: {
            OR: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        },
        orderBy: { timestamp: 'desc' },
        select: {
            fromUserId: true,
            toUserId: true,
            fromUser: { select: { id: true, name: true, number: true } },
            toUser: { select: { id: true, name: true, number: true } }
        }
    });

    // Extract unique users that are not the current user
    const uniqueUsersMap = new Map();
    
    for (const msg of recentMessages) {
        if (msg.fromUserId !== userId && !uniqueUsersMap.has(msg.fromUserId)) {
            uniqueUsersMap.set(msg.fromUserId, msg.fromUser);
        }
        if (msg.toUserId !== userId && !uniqueUsersMap.has(msg.toUserId)) {
            uniqueUsersMap.set(msg.toUserId, msg.toUser);
        }
    }

    return Array.from(uniqueUsersMap.values()).slice(0, 5); // Return top 5 recent
}

export async function RecentPayees({ userId }: { userId: number }) {
    const payees = await getRecentPayees(userId);

    if (payees.length === 0) return null;

    return (
        <div className="mt-8 bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-4">Recent Chats</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {payees.map(payee => (
                    <Link 
                        key={payee.id} 
                        href={`/transfer/${payee.number}`}
                        className="flex flex-col items-center gap-2 min-w-[80px] p-2 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] flex items-center justify-center font-bold text-xl">
                            {payee.name ? payee.name[0].toUpperCase() : payee.number[0]}
                        </div>
                        <span className="text-sm font-medium truncate w-full text-center">
                            {payee.name || payee.number}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
