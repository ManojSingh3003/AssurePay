"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";

export async function getNotifications() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, notifications: [] };
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: Number(session.user.id) },
            orderBy: { createdAt: 'desc' }
        });
        
        return { success: true, notifications };
    } catch (e) {
        return { success: false, notifications: [] };
    }
}

export async function markNotificationsAsRead() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false };
    }

    try {
        await prisma.notification.updateMany({
            where: { 
                userId: Number(session.user.id),
                isRead: false
            },
            data: { isRead: true }
        });
        
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function clearAllNotifications() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false };
    }

    try {
        await prisma.notification.deleteMany({
            where: { userId: Number(session.user.id) }
        });
        
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function getUnreadNotificationCount() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return 0;
    }

    try {
        const count = await prisma.notification.count({
            where: { 
                userId: Number(session.user.id),
                isRead: false
            }
        });
        
        return count;
    } catch (e) {
        return 0;
    }
}
