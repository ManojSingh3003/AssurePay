"use client";

import { useState } from "react";
import { Button, TextInput } from "@repo/ui";
import { updateMerchantProfile } from "../lib/actions/profile";

export function MerchantProfileClient({ merchant }: { merchant: { name: string, email: string } }) {
    const [name, setName] = useState(merchant.name);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSave = async () => {
        setLoading(true);
        setMessage("");
        
        // Call the server action!
        const res = await updateMerchantProfile(name);
        
        if (res.success) {
            setMessage("Profile updated successfully!");
        } else {
            setMessage(res.message || "Something went wrong.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>
            
            <div className="space-y-4">
                <TextInput 
                    label="Business Email" 
                    value={merchant.email}
                    disabled={true} 
                />
                
                <TextInput 
                    label="Business Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your business name"
                />

                {message && (
                    <p className={`text-sm font-medium ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
                        {message}
                    </p>
                )}

                <div className="pt-4">
                    <Button 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={loading || !name || name === merchant.name}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
