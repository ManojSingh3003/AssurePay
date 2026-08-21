"use client";

import { useState } from "react";
import { Button, Modal } from "@repo/ui";
import { AddMoneyCard } from "./AddMoneyCard";
import { WithdrawCard } from "./WithdrawCard";
import { useRouter } from "next/navigation";
import { QRCodeManager } from "./QRCodeManager";

export function TransferActionModals({ userPhone }: { userPhone: string }) {
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showMerchantPay, setShowMerchantPay] = useState(false);
    const [merchantCode, setMerchantCode] = useState("");
    const router = useRouter();

    return (
        <div className="flex flex-col gap-4">
            <Button variant="primary" onClick={() => setShowAddMoney(true)}>
                + Add Money
            </Button>
            <Button variant="secondary" onClick={() => setShowWithdraw(true)}>
                - Withdraw
            </Button>
            <Button variant="secondary" onClick={() => setShowMerchantPay(true)}>
                Pay Merchant
            </Button>
            
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 mt-2 transition-colors">
                <QRCodeManager userPhone={userPhone} />
            </div>

            <Modal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)}>
                <AddMoneyCard />
            </Modal>

            <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)}>
                <WithdrawCard userPhone={userPhone} />
            </Modal>

            <Modal isOpen={showMerchantPay} onClose={() => setShowMerchantPay(false)}>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold mb-4 text-[#0B0B0B] dark:text-zinc-200 transition-colors">Pay a Merchant</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 transition-colors">Enter the APM code of the merchant you want to pay.</p>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="e.g. APM-123456"
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00B4D8] uppercase transition-colors"
                            value={merchantCode}
                            onChange={(e) => setMerchantCode(e.target.value.toUpperCase())}
                        />
                        <Button 
                            variant="primary" 
                            disabled={!merchantCode}
                            onClick={() => {
                                setShowMerchantPay(false);
                                router.push(`/merchant/${merchantCode}`);
                            }}
                        >
                            Pay
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
