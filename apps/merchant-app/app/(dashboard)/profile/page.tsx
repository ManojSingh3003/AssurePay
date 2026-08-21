import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";
import { MerchantProfileClient } from "../../../components/MerchantProfileClient";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    const merchant = await prisma.merchant.findUnique({
        where: { id: Number(session.user.id) }
    });

    if (!merchant) return null;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Business Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Editable Profile Settings */}
                <MerchantProfileClient merchant={{ 
                    name: merchant.name || "", 
                    email: merchant.email || "" 
                }} />

                {/* Read-only Information */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Authentication Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Provider</label>
                                <p className="font-medium text-gray-900">{merchant.auth_type}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">APM Code</label>
                                <p className="font-mono text-[#00B4D8] font-bold">{merchant.merchantCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
