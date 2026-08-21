"use client";

import { useState } from "react";
import { Button, Card, TextInput } from "@repo/ui";
import { createOffRampTransaction } from "../lib/actions/createOffRampTransaction";
import { useRouter } from "next/navigation";


export const WithdrawCard = ({ userPhone }: { userPhone: string }) => {
  const [amt, setAmt] = useState(0);
  const [acc, setAcc] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const r = useRouter();

  const handleSendOtp = async () => {
    console.log("Sending OTP to this number:", userPhone);

    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone: userPhone }), 
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setOtpSent(true);
      alert("OTP sent to terminal!");
    } else {
      alert("Failed to send OTP");
    }
  };

  const onWithdraw = async () => {
    const res = await createOffRampTransaction(amt, acc, ifsc, otp);
    alert(res.message);
    if (res.message.includes("success")) {
        setOtpSent(false);
        setAmt(0);
        setAcc("");
        setIfsc("");
        setOtp("");
        r.refresh();
    }
  };

  if (otpSent) {
    return (
      <Card title="Verify Withdrawal">
        <TextInput 
          label="Enter OTP" 
          placeholder="123456" 
          value={otp}
          onChange={(e) => setOtp(e.target.value)} 
        />
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="secondary" onClick={() => setOtpSent(false)}>Cancel</Button>
          <Button variant="primary" onClick={onWithdraw}>Confirm Withdrawal</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Withdraw Money">
      <TextInput 
        label="Amount" 
        placeholder="Amount" 
        value={amt === 0 ? "" : amt.toString()} 
        onChange={(e) => setAmt(Number(e.target.value))} 
      />
      <div className="pt-2">
        <TextInput label="Account Number" placeholder="123456789" value={acc} onChange={(e) => setAcc(e.target.value)} />
      </div>
      <div className="pt-2">
        <TextInput label="IFSC Code" placeholder="HDFC0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
      </div>
      <div className="mt-8 flex justify-center">
        <Button variant="primary" onClick={handleSendOtp}>Send OTP to Proceed</Button>
      </div>
    </Card>
  );
};