"use client"

import { useState } from "react";
import { TextInput } from "@repo/ui";
import { Button } from "@repo/ui";
import { completeProfile } from "../lib/actions/onboarding";
import { useSession } from "next-auth/react";

export default function ProfileOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { update } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    panNumber: "",
    transactionPin: "",
    confirmPin: "",
    upiId: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // For the custom TextInput which passes the event directly
  const handleTextInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setError("");
    if (formData.transactionPin !== formData.confirmPin) {
      setError("Transaction PINs do not match!");
      return;
    }

    setLoading(true);
    const result = await completeProfile(formData);

    if (result.success) {
      // Update the NextAuth session token state and trigger middleware
      await update({ isProfileComplete: true });
      window.location.href = "/dashboard";
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-[#0B0B0B]">
          Complete Your <span className="text-[#00B4D8]">Profile</span>
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center font-semibold border border-red-100">
            {error}
          </div>
        )}

        {/* STEP 1: Basic Identity */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Step 1: The Basics</h2>
            <TextInput label="Full Legal Name" value={formData.name} onChange={handleTextInputChange("name")} placeholder="John Doe" />
            <TextInput label="Email Address" type="email" value={formData.email} onChange={handleTextInputChange("email")} placeholder="john@example.com" />
            <Button onClick={handleNext} variant="primary" className="w-full mt-4">Next Step</Button>
          </div>
        )}

        {/* STEP 2: KYC Details */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Step 2: Legal KYC</h2>

            <TextInput type="date" label="Date of Birth (DD-MM-YYYY)" value={formData.dob} onChange={handleTextInputChange("dob")} placeholder="01-01-2000" />

            <div className="mb-5">
              <label className="block text-sm font-bold text-[#0B0B0B] mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border-2 border-gray-200 px-4 py-3 rounded-2xl text-[#0B0B0B] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-colors bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <TextInput label="Full Address" value={formData.address} onChange={handleTextInputChange("address")} placeholder="123 Main St, City, State" />
            <TextInput label="PAN Number" value={formData.panNumber} onChange={handleTextInputChange("panNumber")} placeholder="ABCDE1234F" />

            <div className="flex gap-4 mt-8">
              <Button onClick={handleBack} variant="secondary" className="w-1/3">Back</Button>
              <Button onClick={handleNext} variant="primary" className="w-2/3">Next Step</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Security */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Step 3: Vault Security</h2>
            <TextInput label="Set 6-Digit PIN" type="password" value={formData.transactionPin} onChange={handleTextInputChange("transactionPin")} placeholder="••••••" />
            <TextInput label="Confirm 6-Digit PIN" type="password" value={formData.confirmPin} onChange={handleTextInputChange("confirmPin")} placeholder="••••••" />
            <TextInput label="UPI ID (Optional)" value={formData.upiId} onChange={handleTextInputChange("upiId")} placeholder="username@bank" />

            <div className="flex gap-4 mt-8">
              <Button onClick={handleBack} variant="secondary" className="w-1/3">Back</Button>
              <Button onClick={handleSubmit} variant="primary" className="w-2/3">
                {loading ? "Securing Vault..." : "Complete Profile"}
              </Button>
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex gap-3 justify-center mt-8">
          <div className={`h-2.5 w-10 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}></div>
          <div className={`h-2.5 w-10 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}></div>
          <div className={`h-2.5 w-10 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-[#00B4D8]' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    </div>
  );
}