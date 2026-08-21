"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import { checkRateLimit } from "../rateLimit";

export async function payMerchant(merchantId: number, amount: number, pin: string) {
    try {
        // TODO 1: Get the current user session using getServerSession and authOptions
        const session = await getServerSession(authOptions);
        
        // TODO 2: Validate that the user is logged in, the amount is > 0
        if (!session?.user?.id || amount <= 0) {
            return { success: false, message: "Invalid session or amount" }
        }
        
        // TODO 3: (Optional but recommended) Add a rate limit check here 
        const isAllowed = await checkRateLimit(
            `${Number(session.user.id)}_PAYMENT`,
            5, 
            60 * 1000 
        );
        if (!isAllowed) {
            return { success: false, message: "Rate limit exceeded" };
        }
        
        // TODO 4: Fetch the sender (User) from the database to check if they exist
        // and if they have a transactionPin set up.
        const sender = await prisma.user.findUnique({
            where: { id: Number(session.user.id) }
        });
        if (!sender || !sender.transactionPin) {
            return { success: false, message: "Sender not found or PIN not set" };
        }
        // TODO 5: Verify the provided 'pin' against the sender's hashed transactionPin
        // Hint: use bcrypt.compare
        const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
        if (!isPinValid) {
            return { success: false, message: "Invalid PIN" };
        }
        // TODO 6: Start a Prisma transaction: await prisma.$transaction(async (tx) => { ... })
        // Inside the transaction:
        // a) Lock the sender's balance row (SELECT * FROM "Balance" WHERE "userId" = X FOR UPDATE)
        // b) Check if the sender has enough balance (senderBalance.amount >= amount)
        // c) Decrement the sender's balance
        // d) Increment the merchant's balance 
        // e) Create a new MerchantTransfer record logging the payment
        await prisma.$transaction(async (tx) => {

            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(session.user.id)} FOR UPDATE`;

            const senderBalance = await tx.balance.findUnique({
                where: { userId: Number(session.user.id) }
            });
            if (!senderBalance || senderBalance.amount < amount) {
                throw new Error("Insufficient balance");
            }
            await tx.balance.update({
                where: { userId: Number(session.user.id) },
                data: { amount: senderBalance.amount - amount },
            });
            await tx.merchant.update({
                where: { id: merchantId },
                data: { balance: {
                    increment : amount
                } },
            });
            const transfer = await tx.merchantTransfer.create({
                data: {
                    fromUserId: Number(session.user.id),
                    toMerchantId: merchantId,
                    amount,
                },
            });

            await tx.ledgerEntry.createMany({
                data: [
                    {
                        userId: Number(session.user.id),
                        amount: -amount,
                        type: "MERCHANT_PAYMENT",
                        referenceId: transfer.id.toString()
                    },
                    {
                        merchantId: merchantId,
                        amount: amount,
                        type: "MERCHANT_PAYMENT",
                        referenceId: transfer.id.toString()
                    }
                ]
            });
        })
        
        return { success: true, message: "Payment sent to merchant!" }

    } catch (error) {
        console.log(error);
        return { success: false, message: "Transaction failed" }
    }    
}
