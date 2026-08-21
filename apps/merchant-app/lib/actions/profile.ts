"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";

export async function updateMerchantProfile(newName: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, message: "Not authenticated" };
        }

        if (!newName || newName.length < 2) {
            return { success: false, message: "Name is too short" };
        }

        await prisma.merchant.update({
            where: { id: Number(session.user.id) },
            data: { name: newName }
        });

        return { success: true };
    } catch (error) {
        return { success: false, message: "Internal server error" };
    }
}
