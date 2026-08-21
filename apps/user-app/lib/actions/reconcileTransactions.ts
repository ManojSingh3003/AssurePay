"use server";

import { prisma } from "@repo/db";
import Razorpay from "razorpay";

const rzp = new Razorpay({
   key_id: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
   key_secret: process.env.RZP_KEY_SECRET!,
});

export async function reconcileTransactions(userId?: number) {
    try {
        const whereClause = userId 
            ? { status: "Processing" as const, userId } 
            : { status: "Processing" as const };
        
        // Find all processing transactions
        const pendingTransactions = await prisma.onRampTransaction.findMany({
            where: whereClause
        });

        if (pendingTransactions.length === 0) {
            return { msg: "No pending transactions found", processed: 0 };
        }

        let processedCount = 0;

        // Process in concurrency chunks of 10 to avoid rate limits
        const chunkSize = 10;
        for (let i = 0; i < pendingTransactions.length; i += chunkSize) {
            const chunk = pendingTransactions.slice(i, i + chunkSize);
            
            await Promise.all(chunk.map(async (tx) => {
                try {
                    // Fetch real status from Razorpay
                    const order = await rzp.orders.fetch(tx.token);
                    
                    if (order.status === "paid") {
                        // Order is paid, we must reconcile it
                        await prisma.$transaction(async (dbTx) => {
                            // Lock the transaction row
                            await dbTx.$queryRaw`SELECT * FROM "OnRampTransaction" WHERE "token" = ${tx.token} FOR UPDATE`;
                            
                            // Re-check status inside the lock to ensure webhook didn't just process it
                            const currentTx = await dbTx.onRampTransaction.findUnique({
                                where: { token: tx.token }
                            });
                            
                            if (currentTx?.status !== "Processing") return;
                            
                            // Lock the balance row
                            await dbTx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${tx.userId} FOR UPDATE`;
                            
                            // Increment balance
                            await dbTx.balance.upsert({
                                where: { userId: tx.userId },
                                update: { amount: { increment: tx.amount } },
                                create: { userId: tx.userId, amount: tx.amount, locked: 0 }
                            });
                            
                            // Create Ledger Entry
                            await dbTx.ledgerEntry.create({
                                data: {
                                    userId: tx.userId,
                                    amount: tx.amount,
                                    type: "ONRAMP",
                                    referenceId: tx.token
                                }
                            });
                            
                            // Mark Success
                            await dbTx.onRampTransaction.update({
                                where: { token: tx.token },
                                data: { status: "Success" }
                            });
                            
                            // Send Notification
                            await dbTx.notification.create({
                                data: {
                                    userId: tx.userId,
                                    type: "SYSTEM",
                                    title: "Funds Recovered",
                                    message: `₹${tx.amount / 100} was pending and has been successfully recovered to your wallet.`
                                }
                            });
                        });
                        
                        processedCount++;
                    }
                } catch (e) {
                    console.error(`Failed to reconcile order ${tx.token}`, e);
                }
            }));
        }

        return { msg: "Reconciliation complete", processed: processedCount };
    } catch (error) {
        console.error("Reconciliation Error:", error);
        return { msg: "Internal error during reconciliation", processed: 0 };
    }
}
