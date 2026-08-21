import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth"; 
import { prisma } from "@repo/db";
import { generateAndSaveOtp } from "../../../../lib/otp"; 
import { checkRateLimit } from "../../../../lib/rateLimit";

export async function POST(req: Request) {
    try {
        let phone = "";
        
        const session = await getServerSession(authOptions);

        if (session?.user?.id) {

            const userId = Number(session.user.id);
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (user?.number) {
                phone = user.number;
            }
        } 
        

        if (!phone) {
            const body = await req.json();
            phone = body.phone;
        }


        if (!phone) {
            return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
        }

        // Rate Limit check: 3 requests per 15 minutes (900000 ms)
        const isAllowed = await checkRateLimit(`otp_${phone}`, 3, 900000);
        if (!isAllowed) {
            return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
        }

        // 4. Send the OTP
        await generateAndSaveOtp(phone);
        
        return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
        
    } catch (e) {
        console.error("Error sending OTP:", e);
        return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
    }
}