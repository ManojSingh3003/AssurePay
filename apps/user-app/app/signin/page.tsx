"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthLayout, Card, TextInput, Button } from "@repo/ui";
import Link from "next/link";

export default function SignIn() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    await signIn("credentials", {
      phone,
      password,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <AuthLayout>
      <Card title="Welcome Back" >
        <TextInput 
          label="Phone Number" 
          placeholder="Enter your registered number" 
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

        <div className="flex justify-end mb-6 text-sm">
          <a href="#" className="text-gray-400 hover:text-[#00B4D8] transition-colors font-medium">
            Forgot password?
          </a>
        </div>

        <Button onClick={handleSignIn} variant="primary">
          Sign In to AssurePay
        </Button>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          New to AssurePay?{" "}
          <Link href="/signup" className="text-[#00B4D8] hover:text-[#06B6D4] font-bold">
            Create an account
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}