"use client";

import { useState } from "react";
import { Button, TextInput, Modal } from "@repo/ui";
import { payMerchant } from "../lib/actions/merchantTransfers";
import { useRouter } from "next/navigation";

export function MerchantPaymentClient({ merchant }: { merchant: { id: number, name: string | null, merchantCode: string } }) {
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: "success" | "error", message?: string}>({ isOpen: false, type: "success" });
    const router = useRouter();

    const handlePayment = async () => {
        setError("");
        const parsedAmount = parseFloat(amount);
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        if (pin.length < 4) {
            setError("Please enter a valid PIN.");
            return;
        }

        setLoading(true);
        const res = await payMerchant(merchant.id, parsedAmount * 100, pin);
        
        if (res.success) {
            setModalConfig({ isOpen: true, type: "success" });
        } else {
            setModalConfig({ isOpen: true, type: "error", message: res.message });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-6 max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="bg-[#00B4D8]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#00B4D8]">
                        {merchant.name?.[0]?.toUpperCase() || "M"}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{merchant.name || "Unknown Merchant"}</h2>
                <p className="text-sm text-gray-500 font-mono mt-1">{merchant.merchantCode}</p>
            </div>

            <div className="space-y-4">
                <TextInput 
                    label="Amount (₹)" 
                    placeholder="Enter amount" 
                    onChange={(e) => setAmount(e.target.value)} 
                />
                
                <TextInput 
                    label="Transaction PIN" 
                    placeholder="Enter your 4-digit PIN" 
                    type="password"
                    value={pin}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= 4 && /^\d*$/.test(val)) {
                            setPin(val);
                        }
                    }} 
                />

                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                <div className="pt-4">
                    <Button 
                        variant="primary" 
                        disabled={loading || !amount || !pin}
                        onClick={handlePayment}
                    >
                        {loading ? "Processing..." : `Pay ₹${amount || "0"}`}
                    </Button>
                </div>
            </div>

            {/* Payment Status Modal */}
            <Modal 
                isOpen={modalConfig.isOpen} 
                onClose={() => {
                    setModalConfig({ ...modalConfig, isOpen: false });
                    if (modalConfig.type === "success") {
                        router.push("/transactions");
                        router.refresh();
                    }
                }}
            >
                <div className="p-6 text-center">
                    {modalConfig.type === "success" ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h3>
                            <p className="text-gray-500 mb-6">
                                You have successfully paid <span className="font-bold text-gray-900">₹{amount}</span> to <span className="font-bold text-[#00B4D8]">{merchant.name}</span>.
                            </p>
                            <Button variant="primary" onClick={() => {
                                setModalConfig({ ...modalConfig, isOpen: false });
                                router.push("/transactions");
                                router.refresh();
                            }}>
                                View Transaction Ledger
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Failed</h3>
                            <p className="text-gray-500 mb-6">
                                {modalConfig.message || "An unexpected error occurred while processing your payment."}
                            </p>
                            <Button variant="secondary" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                                Try Again
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}
