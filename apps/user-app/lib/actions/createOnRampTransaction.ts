"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";
import { checkRateLimit } from "../rateLimit";
import Razorpay from "razorpay";

const rzp = new Razorpay({
   key_id: process.env.NEXT_PUBLIC_RZP_KEY_ID || "dummy_key",
   key_secret: process.env.RZP_KEY_SECRET || "dummy_secret",
});

export async function createOnRampTransaction(provider: string, amt: number) {
    const sess = await getServerSession(authOptions);
    if (!sess?.user || !sess.user.id) {
        return { msg: "Unauthenticated request" };
    }

    if (!amt || amt < 1) {
        return { msg: "Amount must be at least ₹1" };
    }

    const isAllowed = await checkRateLimit(`onramp_${sess.user.id}`, 5, 600000);
    if (!isAllowed) {
        return { msg: "Too many requests. Please try again later." };
    }

    try {
        const order = await rzp.orders.create({
            amount: amt * 100,
            currency: "INR",
            receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
            notes: {
                userId: sess.user.id 
            }
        });
        
        await prisma.$transaction(async (tx) => {
            await tx.onRampTransaction.create({
                data: {
                    provider,
                    status: "Processing",
                    startTime: new Date(),
                    token: order.id,
                    userId: Number(sess.user.id),
                    amount: amt * 100
                }
            });
        });
        

        return { token: order.id, msg: "Order created successfully" };

    } catch (error: unknown) {

        console.error("Razorpay Order Error:", error);

        return { 
            msg: (error as any).error?.description || "Failed to initialize payment gateway" 
        };
    }
}