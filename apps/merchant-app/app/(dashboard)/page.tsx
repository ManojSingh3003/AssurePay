import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import Email from "next-auth/providers/email";
import QRCode from 'react-qr-code';
import QRCode from 'react-qr-code';

type Transaction = {
  id: number;
  amount: number;
  timestamp: Date;
  fromUser?: {
    name: string | null;
    number: string;
  } | null;
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    redirect("/api/auth/signin");
  }

  const merchantData =await prisma.merchant.findUnique({
    where:{
      email: session.user.email
    }
  })
  const merchantBalance = merchantData?.balance || 0; 

  const recentTransfers = merchantData ? await prisma.merchantTransfer.findMany({
    where: {
      toMerchantId: merchantData.id
    },
    include: {
      fromUser: true
    },
    orderBy: {
      timestamp: 'desc'
    }
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Merchant Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Revenue Card */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h2>
            <p className="text-5xl font-bold text-[#00B4D8]">₹{(merchantBalance / 100).toFixed(2)}</p>
            
            <div className="mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payments</h3>
              
              {recentTransfers.length === 0 ? (
                <p className="text-gray-500 italic">No payments received yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentTransfers.map((tx: Transaction) => (
                    <div key={tx.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900">{tx.fromUser?.name || "Unknown User"}</p>
                        <p className="text-sm text-gray-500">{tx.fromUser?.number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#00B4D8]">+ ₹{(tx.amount / 100).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Card */}
          <div className="col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Receive Payments</h2>
            <p className="text-sm text-gray-500 mb-8">Users can scan this code in the AssurePay app to pay you.</p>
            
            <div className="bg-gray-100 p-4 rounded-2xl w-full aspect-square flex items-center justify-center">

                <QRCode
                    size={156}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={merchantData?.merchantCode || ""}
                    viewBox={`0 0 256 256`}
                />  
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl w-full">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Your Merchant Code</p>
                <p className="text-2xl font-bold text-gray-900 tracking-widest">{merchantData?.merchantCode}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}