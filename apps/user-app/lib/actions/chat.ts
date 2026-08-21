"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import {prisma} from "@repo/db";

export async function sendTextMessage(toUserId: number, content: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        await prisma.p2pMessage.create({
            data: {
                fromUserId: Number(session.user.id),
                toUserId,
                content,
                timestamp: new Date()
            }
        });

        const sender = await prisma.user.findUnique({
            where: { id: Number(session.user.id) }
        });

        await prisma.notification.create({
            data: {
                userId: toUserId,
                type: "MESSAGE",
                title: "New Message",
                message: `You received a message from ${sender?.name || sender?.number}.`,
            }
        });

        return { success: true, message: "Sent" };
    } catch (e) {
        return { success: false, message: "Error sending message" };
    }
}
