"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";
import { checkRateLimit } from "../rateLimit";
import bcrypt from "bcrypt";

export async function p2pTransfer(reciever_number:string,amount:number, pin:string){
    try{
        const session = await getServerSession(authOptions);

        if (!session?.user || !session.user?.id) {
            return {
                success: false,
                message: "Unauthorized"
            }
        }
        if (amount <= 0) {
            return {
                success: false,
                message: "Amount must be greater than 0"
            }
        }

        const isAllowed = await checkRateLimit(`p2p_${session.user.id}`, 10, 3600000);
        if (!isAllowed) {
            return {
                success: false,
                message: "Too many transfer requests. Please try again later."
            }
        }

        const reciever = await prisma.user.findUnique({
            where: {
                number: reciever_number
            }
        })

        if (!reciever) {
            return {
                success: false,
                message: "Reciever not found"
            }
        }

        const sender = await prisma.user.findUnique({
            where: { id: Number(session.user.id) }
        });

        if (!sender) {
            return { success: false, message: "Sender not found" };
        }

        if (!sender.transactionPin) {
            return { success: false, message: "PIN_REQUIRED" };
        }

        const isPinValid = await bcrypt.compare(pin, sender.transactionPin);
        if (!isPinValid) {
            return { success: false, message: "Invalid Transaction PIN" };
        }

        await prisma.$transaction(async (tx) => {
            // Lock the sender's balance row to prevent double spending
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(session.user.id)} FOR UPDATE`;

            const senderBalance = await tx.balance.findUnique({
                where: {
                    userId: Number(session.user.id)
                }
            })

            if(!senderBalance){
                throw new Error("balance not found")
            }

            if(senderBalance.amount<amount){
                throw new Error("Insufficient balance")
            }

            await tx.balance.update({
                data:{
                    amount:{
                        decrement:amount
                    }
                },
                where:{
                    userId:Number(session.user.id)
                }
            })

            await tx.balance.upsert({
                where:{
                    userId:Number(reciever.id)
                },
                update:{
                    amount:{
                        increment:amount
                    }
                },
                create: {
                    userId: Number(reciever.id),
                    amount: amount,
                    locked: 0
                }
            })

            const transfer = await tx.p2pTransfer.create({
                data: {
                    fromUserId: Number(session.user.id),
                    toUserId: Number(reciever.id),
                    amount,
                    timestamp: new Date()
                }
            })

            await tx.ledgerEntry.createMany({
                data: [
                    {
                        userId: Number(session.user.id),
                        amount: -amount,
                        type: "P2P_TRANSFER",
                        referenceId: transfer.id.toString()
                    },
                    {
                        userId: Number(reciever.id),
                        amount: amount,
                        type: "P2P_TRANSFER",
                        referenceId: transfer.id.toString()
                    }
                ]
            });

            await tx.p2pMessage.create({
                data: {
                    content: null,
                    timestamp: new Date(),
                    fromUserId: Number(session.user.id),
                    toUserId: reciever.id,
                    transferId: transfer.id
                }
            });

            await tx.notification.create({
                data: {
                    userId: reciever.id,
                    type: "TRANSFER",
                    title: "Funds Received",
                    message: `You received ₹${amount / 100} from ${sender?.name || sender?.number}.`,
                }
            });
        })

        return {
            success:true,
            message:"Transaction successful"
        }


    }catch(error){
        console.log(error);
        return {
            message:"Transaction failed"
        }
    }    
}