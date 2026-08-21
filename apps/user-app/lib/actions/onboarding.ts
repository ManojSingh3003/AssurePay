"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";

import bcrypt from "bcrypt";

interface ProfileData {
  name: string;
  email: string;
  profilePicture?: string;
  dob: string; 
  gender: string;
  address: string;
  panNumber: string;
  transactionPin: string;
  upiId?: string;
}

export async function completeProfile(data: ProfileData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  if (!data.name?.trim() || !data.email?.trim() || !data.dob?.trim() || 
      !data.gender?.trim() || !data.address?.trim() || !data.transactionPin?.trim()) {
    return { success: false, message: "All required fields must be filled" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, message: "Invalid email format" };
  }

  const d = new Date(data.dob);
  if (isNaN(d.getTime())) {
    return { success: false, message: "Invalid date of birth" };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(data.panNumber)) {
    return { success: false, message: "Invalid PAN format. Use format: ABCDE1234F" };
  }

  if (!/^\d{6}$/.test(data.transactionPin)) {
    return { success: false, message: "Transaction PIN must be exactly 6 digits" };
  }


  const hashedPin = await bcrypt.hash(data.transactionPin, 10); 

  try {
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        name: data.name,
        email: data.email,
        profilePicture: data.profilePicture,
        dob: new Date(data.dob),
        gender: data.gender,
        address: data.address,
        panNumber: data.panNumber,
        transactionPin: hashedPin,
        upiId: data.upiId || null,
        isProfileComplete: true,
      }
    });

    return { success: true, message: "Profile completed successfully!" };
  } catch (error: any) {
    console.error("Profile update error:", error);
    if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'Field';
        return { success: false, message: `${field} is already in use by another account.` };
    }
    return { success: false, message: "Database error while updating profile." };
  }
}