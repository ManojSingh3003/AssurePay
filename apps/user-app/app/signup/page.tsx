"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthLayout, Card, TextInput, Button } from "@repo/ui";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setOtpSent(true);
      alert("OTP sent to terminal!");
    } else {
      alert("Failed to send OTP");
    }
  };

  const handleSignUp = async () => {
    const res = await fetch("/api/auth/signup",{
      method:"POST",
      body: JSON.stringify({
        phone,
        password,
        otp
      })
    })
    if(res.ok){
      await signIn("credentials", {
        phone,
        password,
        callbackUrl: "/profile",
      });
    }else{
      const data = await res.json();
      alert(data.message || "Failed to sign up");
    }
  };

  return (
    <AuthLayout>
      <Card title="Create AssurePay Account">
        <TextInput 
          label="Phone Number" 
          placeholder="Enter 10-digit number" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        
        <TextInput 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />

        {!otpSent ? (
          <Button onClick={handleSendOtp} variant="primary" className="mt-4">
            Send Verification Code
          </Button>
        ) : (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TextInput 
              label="Enter OTP" 
              placeholder="123456" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
            />
            <Button onClick={handleSignUp} variant="primary">
              Verify & Sign Up
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#00B4D8] hover:text-[#06B6D4] font-bold">
            Sign in here
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}