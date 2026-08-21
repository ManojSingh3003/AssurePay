import { prisma } from "@repo/db";

export async function generateAndSaveOtp(phone: string) {
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.upsert({
        where: { phone },
        update: { code, expiresAt },
        create: { phone, code, expiresAt }
    });

    // TODO : Actually send the SMS via Twilio/AWS here later
    console.log(`[MOCK SMS] Sent ${code} to ${phone}`);

    return true;
}

export async function verifyOtpCode(phone: string, code: string) {
    const record = await prisma.oTP.findUnique({ where: { phone } });
    
    if (!record || record.code !== code || record.expiresAt < new Date()) {
        return false;
    }

    await prisma.oTP.delete({ where: { phone } });
    return true;
}