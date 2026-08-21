"use client";

import { useState } from "react";
import { Button, Card, TextInput } from "@repo/ui";
import { createOnRampTransaction } from "../lib/actions/createOnRampTransaction";
import { cancelOnRampTransaction } from "../lib/actions/cancelOnRampTransaction";
import Script from "next/script";
import { useRouter } from "next/navigation";

export const AddMoneyCard = () => {
  const [amt, setAmt] = useState(0);
  const [bank, setBank] = useState("HDFC");
  const router = useRouter();

  const handlePay = async () => {
    const res = await createOnRampTransaction(bank, amt);

    if (!res.token) {
      return alert(res.msg);
    }

    const opts = {
      key: process.env.NEXT_PUBLIC_RZP_KEY_ID,
      amount: amt * 100,
      currency: "INR",
      name: "AssurePay",
      description: "Wallet Deposit",
      order_id: res.token,
      handler: function (response: { razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }) {
        alert("Payment captured via Webhook!");
        router.refresh();
      },
      modal: {
        ondismiss: async function() {
          await cancelOnRampTransaction(res.token);
          router.refresh();
        }
      }
    };

    const rzp = new (window as any).Razorpay(opts);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Card title="Add Money">
        <TextInput
          label="Amount"
          placeholder="Amount"
          value={amt === 0 ? "" : amt.toString()}
          onChange={(e) => setAmt(Number(e.target.value))}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
          <select
            onChange={(e) => setBank(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#00B4D8] focus:border-[#00B4D8] block p-3"
          >
            <option value="HDFC">HDFC Bank</option>
            <option value="AXIS">Axis Bank</option>
          </select>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="primary" onClick={handlePay}>
            Add Money
          </Button>
        </div>
      </Card>
    </>
  );
};