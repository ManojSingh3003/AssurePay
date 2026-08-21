"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response=await fetch("/api/auth/signup",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(form)
            });

            if(response.ok){
                router.push("/api/auth/signin");
            }
            
            
        } catch (error) {
            alert("Signup failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Merchant Sign Up</h1>
                
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setForm({...form, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setForm({...form, password: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#00B4D8] text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors mt-4"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <a href="/api/auth/signin" className="text-blue-500 font-medium">Log in</a>
                </p>
            </div>
        </div>
    );
}
