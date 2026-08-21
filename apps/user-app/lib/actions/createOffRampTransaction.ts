
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";
import { verifyOtpCode } from "../otp";
import { checkRateLimit } from "../rateLimit";

export async function createOffRampTransaction(amount: number, bankAccount: string, ifsc: string, otp: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.user.id) {
        return { message: "Unauthenticated request" };
    }

    const userId = Number(session.user.id);
    const amountInPaise = amount * 100;

    if (amount <= 0) {
        return { message: "Amount must be greater than 0" };
    }

    const isAllowed = await checkRateLimit(`offramp_${userId}`, 3, 3600000);
    if (!isAllowed) {
        return { message: "Too many withdrawal requests. Please try again later." };
    }

    try {

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.number) {
            return { message: "User phone number not found" };
        }

        const isValidOtp = await verifyOtpCode(user.number, otp);
        if (!isValidOtp) {
            return { message: "Invalid or expired OTP" };
        }

        await prisma.$transaction(async (tx) => {
            // Lock the balance row to prevent double spending
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${userId} FOR UPDATE`;

            const balance = await tx.balance.findUnique({
                where: { userId: userId }
            });

            if (!balance || balance.amount < amountInPaise) {
                throw new Error("Insufficient wallet balance");
            }

            await tx.balance.update({
                where: { userId: userId },
                data: { amount: { decrement: amountInPaise } }
            });

            const offRampTxn = await tx.offRampTransaction.create({
                data: {
                    status: "Success",
                    amount: amountInPaise,
                    startTime: new Date(),
                    userId: userId,
                    token: `mock_txn_${Math.random().toString().substring(2, 10)}`, 
                }
            });

            await tx.ledgerEntry.create({
                data: {
                    userId: userId,
                    amount: -amountInPaise,
                    type: "OFFRAMP",
                    referenceId: offRampTxn.token
                }
            });
        });

        return { message: "Withdrawal processed successfully (Mock Flow)" };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to process withdrawal";
        return { message };
    }
}