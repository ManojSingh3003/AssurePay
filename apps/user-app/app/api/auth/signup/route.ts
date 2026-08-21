import { prisma } from "@repo/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { checkRateLimit } from "../../../../lib/rateLimit";

export async function POST(req:Request){
    try{
        // extract info
        const body = await req.json();
        const phone=body.phone;
        const password=body.password;
        const otp=body.otp;

        if (!phone) {
            return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
        }

        // Rate Limit check: 5 signup attempts per 1 hour (3600000 ms)
        const isAllowed = await checkRateLimit(`signup_${phone}`, 5, 3600000);
        if (!isAllowed) {
            return NextResponse.json({ success: false, message: "Too many signup attempts. Please try again later." }, { status: 429 });
        }

        // validate info
        const user_otp=await prisma.oTP.findUnique({
            where:{
                phone:phone
            }
        })
        if(!user_otp){
            return NextResponse.json({
                success:false,
                message:"OTP SERVICE NOT WORKING"
            })
        }
        if( user_otp.code !== otp){
            return NextResponse.json({
                success:false,
                message:"Invalid OTP"
            })
        }
        if(user_otp.expiresAt < new Date() ){
            return NextResponse.json({
                success:false,
                message:"OTP expired"
            })
        }    
        //exisiting user
        const exisiting_user=await prisma.user.findUnique({
            where:{
                number:phone
            }
        })
        if(exisiting_user){
            return NextResponse.json({
                success:false,
                message:"User already exists"
            })  
        }
        //creat user
        const hashedPassword=await bcrypt.hash(password,10);
    
        await prisma.user.create({
            data:{
                number:phone,
                password:hashedPassword,
                Balance: {
                    create: {
                        amount: 0,
                        locked: 0
                    }
                }
            }
        })

        //delete otp
        await prisma.oTP.deleteMany({
            where:{
                phone
            }
        })

        return NextResponse.json({
            success:true,
            message:"User Created Successfully"
        })
    }
    catch(error){
        console.log(error);
        return NextResponse.json({
            success:false,
            message:"Internal server error"
        },{
            status:500
        })
    }
}