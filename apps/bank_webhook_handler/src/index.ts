import "dotenv/config";
import express from "express";
import { prisma } from "@repo/db";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { msg: "Too many requests from this IP, please try again later" }
});

app.use("/rzpWebhook", webhookLimiter);

app.post("/rzpWebhook", async (req, res) => {
  const secret = process.env.RZP_WEBHOOK_SECRET!;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).json({ msg: "Invalid signature" });
  }

  const eventType = req.body.event; 
  const pmt = req.body?.payload?.payment?.entity;
  
  if (!pmt || !pmt.order_id) {
    return res.status(400).json({ msg: "Invalid Payload" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Lock the transaction row to prevent race conditions (double crediting)
      await tx.$queryRaw`SELECT * FROM "OnRampTransaction" WHERE "token" = ${pmt.order_id} FOR UPDATE`;
      
      const transaction = await tx.onRampTransaction.findUnique({
        where: { token: pmt.order_id }
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }
      
      if (transaction.status !== "Processing") {
        throw new Error("Already processed");
      }

      const userId = transaction.userId;

      if (eventType === "payment.captured") {
        // Lock the balance row before updating
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${userId} FOR UPDATE`;

        await tx.balance.upsert({
            where: { userId: userId },
            update: { 
                amount: { increment: transaction.amount }
            },
            create: { 
                userId: userId, 
                amount: transaction.amount, 
                locked: 0 
            }
        });

        await tx.ledgerEntry.create({
            data: {
                userId: userId,
                amount: transaction.amount,
                type: "ONRAMP",
                referenceId: pmt.order_id
            }
        });

        await tx.onRampTransaction.update({
            where: { token: pmt.order_id }, 
            data: { status: "Success" }
        });

        await tx.notification.create({
            data: {
                userId: userId,
                type: "SYSTEM",
                title: "Funds Added",
                message: `₹${transaction.amount / 100} has been added to your wallet successfully.`
            }
        });
      } 
      else if (eventType === "payment.failed") {
        await tx.onRampTransaction.update({
            where: { token: pmt.order_id }, 
            data: { status: "Failure" }
        });
      } 
      else {
        throw new Error("Event ignored");
      }
    });

    return res.status(200).json({ msg: "Webhook processed" });

  } catch(e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "Unknown Error";
    
    if (errorMessage === "Already processed" || errorMessage === "Event ignored") {
        return res.status(200).json({ msg: errorMessage });
    }
    if (errorMessage === "Transaction not found") {
        return res.status(400).json({ msg: errorMessage });
    }
    return res.status(500).json({ msg: "Database Error" });
  }
});

app.listen(3003, () => console.log("Running on 3003"));