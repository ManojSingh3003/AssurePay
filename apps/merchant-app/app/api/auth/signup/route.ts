import { NextResponse } from "next/server";
import { prisma, AuthType } from "@repo/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, password } = body;

        
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const merchant = await prisma.merchant.findUnique({ 
          where: {
            email: email
          }
        });

        if(merchant){
          return NextResponse.json({ message: "Merchant already exists" }, { status: 400 });
        }

        const randomString=Math.random().toString(36).substring(2,8).toUpperCase();
        const merchantCode=`APM-${randomString}`;


        const hashedPassword=await bcrypt.hash(password,10);

        const newMerchant = await prisma.merchant.create({
            data: {
                email,
                name,
                password: hashedPassword,
                merchantCode,
                auth_type: AuthType.Email
            }
        });

        return NextResponse.json({ message: "Merchant created successfully!" }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
