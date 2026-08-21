"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";
import Razorpay from "razorpay";

const rzp = new Razorpay({
   key_id: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
   key_secret: process.env.RZP_KEY_SECRET!,
});

export async function cancelOnRampTransaction(token: string) {
    const sess = await getServerSession(authOptions);
    if (!sess?.user || !sess.user.id) {
        return { msg: "Unauthenticated request" };
    }

    try {
        const tx = await prisma.onRampTransaction.findUnique({
            where: { token }
        });

        // Only allow failing if it belongs to the user and is still Processing
        if (tx && tx.userId === Number(sess.user.id) && tx.status === "Processing") {
            // Verify with Razorpay that it wasn't actually paid
            const order = await rzp.orders.fetch(token);
            if (order.status === "paid") {
                return { success: false, msg: "Transaction was already paid." };
            }

            await prisma.onRampTransaction.update({
                where: { token },
                data: { status: "Failure" }
            });
            return { success: true };
        }
        return { success: false, msg: "Transaction cannot be cancelled" };
    } catch (error) {
        console.error("Error cancelling transaction:", error);
        return { success: false, msg: "Failed to cancel transaction" };
    }
}
