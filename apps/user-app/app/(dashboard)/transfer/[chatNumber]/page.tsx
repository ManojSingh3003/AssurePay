import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import {prisma} from "@repo/db";
import { redirect } from "next/navigation";
import { TransferChat } from "../../../../components/TransferChat";

export default async function ChatPage({ params }: { params: { chatNumber: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    const resolvedParams = await params;
    const currentUserNumber = session.user.email; // Using email field as number based on existing schema
    const targetNumber = resolvedParams.chatNumber;

    if (currentUserNumber === targetNumber) {
        return <div className="p-8 text-center text-gray-500">You cannot chat with yourself.</div>;
    }

    const targetUser = await prisma.user.findFirst({
        where: { number: targetNumber }
    });

    if (!targetUser) {
        return <div className="p-8 text-center text-gray-500">User not found.</div>;
    }

    // Fetch message history between these two users
    const messages = await prisma.p2pMessage.findMany({
        where: {
            OR: [
                { fromUserId: Number(session.user.id), toUserId: targetUser.id },
                { fromUserId: targetUser.id, toUserId: Number(session.user.id) }
            ]
        },
        orderBy: { timestamp: 'asc' },
        include: { transfer: true } // Include payment details if it's a payment bubble
    });

    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        fromUserId: msg.fromUserId,
        timestamp: msg.timestamp,
        transferId: msg.transferId,
        transfer: msg.transfer ? { amount: msg.transfer.amount } : undefined
    }));

    return (
        <div className="w-full max-w-4xl mx-auto h-[80vh] flex flex-col">
            <h1 className="text-2xl font-bold border-b pb-4 mb-4">
                Chat with <span className="text-[#00B4D8]">{targetUser.name || targetUser.number}</span>
            </h1>
            
            <TransferChat 
                key={targetUser.id}
                initialMessages={formattedMessages} 
                targetUserId={targetUser.id} 
                targetUserNumber={targetUser.number}
                currentUserId={Number(session.user.id)}
            />
        </div>
    );
}
