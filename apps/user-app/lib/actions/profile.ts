"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db";

interface UpdateData {
  name: string;
  email: string;
  panNumber: string;
  dob: string;
}

export async function updateProfileInfo(data: UpdateData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    return { success: false, message: "Unauthorized" };
  }

  // Only check the fields that your dashboard form actually sends
  if (!data.name?.trim() || !data.email?.trim() || !data.panNumber?.trim()) {
    return { success: false, message: "Name, Email, and PAN are required" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, message: "Invalid email format" };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(data.panNumber)) {
    return { success: false, message: "Invalid PAN format" };
  }
  
  const d = new Date(data.dob);
  if (isNaN(d.getTime())) {
    return { success: false, message: "Invalid date" };
  }

  try {
    await prisma.user.update({
      where: { id: Number((session.user as any).id) },
      data: {
        name: data.name,
        email: data.email,
        panNumber: data.panNumber,
        dob: d,
      }
    });

    return { success: true, message: "Profile updated successfully!" };
  } catch (error: unknown) {
    console.error("Profile Update Error:", error);
    return { success: false, message: "Database error while updating profile." };
  }
}

export async function updateProfilePicture(base64Image: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) return { success: false };

  try {
    await prisma.user.update({
      where: { id: Number((session.user as any).id) },
      data: { profilePicture: base64Image }
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

import bcrypt from "bcrypt";

export async function checkHasPin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) return false;

  const user = await prisma.user.findUnique({
    where: { id: Number((session.user as any).id) },
    select: { transactionPin: true }
  });

  return !!user?.transactionPin;
}

export async function setTransactionPin(pin: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) return { success: false, message: "Unauthorized" };

  if (!pin || pin.length !== 4 || isNaN(Number(pin))) {
    return { success: false, message: "PIN must be exactly 4 digits." };
  }

  try {
    const hashedPin = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: Number((session.user as any).id) },
      data: { transactionPin: hashedPin }
    });
    return { success: true, message: "PIN set successfully." };
  } catch (e) {
    return { success: false, message: "Failed to set PIN." };
  }
}

export async function changeTransactionPin(oldPin: string, newPin: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) return { success: false, message: "Unauthorized" };

  if (!oldPin || oldPin.length !== 4 || isNaN(Number(oldPin))) {
    return { success: false, message: "Old PIN must be exactly 4 digits." };
  }
  if (!newPin || newPin.length !== 4 || isNaN(Number(newPin))) {
    return { success: false, message: "New PIN must be exactly 4 digits." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number((session.user as any).id) },
      select: { transactionPin: true }
    });

    if (!user || !user.transactionPin) {
      return { success: false, message: "You don't have a PIN set up." };
    }

    const isValid = await bcrypt.compare(oldPin, user.transactionPin);
    if (!isValid) {
      return { success: false, message: "Incorrect Old PIN." };
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    await prisma.user.update({
      where: { id: Number((session.user as any).id) },
      data: { transactionPin: hashedPin }
    });
    return { success: true, message: "PIN changed successfully." };
  } catch (e) {
    return { success: false, message: "Failed to change PIN." };
  }
}