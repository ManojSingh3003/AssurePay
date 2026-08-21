import { prisma } from "@repo/db";
import { MerchantPaymentClient } from "../../../../components/MerchantPaymentClient";

export default async function PayMerchantPage(props: { params: Promise<{ code: string }> }) {
    const params = await props.params;
    const merchant = await prisma.merchant.findUnique({
        where: {
            merchantCode: params.code
        }
    });

    if (!merchant) {
        return (
            <div className="flex flex-col items-center justify-center p-8 mt-12 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto text-center shadow-sm">
                <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">!</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Merchant Not Found</h2>
                <p className="text-gray-500">We couldn't find a merchant with the code: <span className="font-mono font-bold">{params.code}</span></p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Pay Merchant</h1>
                <p className="text-gray-500 mt-1">Send money securely to an AssurePay verified merchant.</p>
            </div>
            
            <MerchantPaymentClient merchant={{ id: merchant.id, name: merchant.name, merchantCode: merchant.merchantCode }} />
        </div>
    );
}
