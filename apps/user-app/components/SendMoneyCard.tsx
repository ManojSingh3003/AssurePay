"use client";

import { Button, Card, TextInput } from "@repo/ui"; 
import { useState } from "react"; 
import { useRouter } from "next/navigation"; 

export function SendMoneyCard() { 
    const [number, setNumber] = useState(""); 
    const router = useRouter(); 

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); 
        
        if (!number) return; 

        router.push(`/transfer/${number}`);
    };

    return (
        <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-zinc-800 flex flex-col gap-6 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#0B0B0B] dark:text-zinc-200 transition-colors">Find Contact</h2>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 transition-colors">Enter a phone number to chat and pay</p>
                </div>
            </div>

            <form onSubmit={onSearch} className="flex flex-col gap-4">
                <TextInput 
                    label="Phone Number" 
                    name="number" 
                    placeholder="e.g. 9876543210" 
                    value={number} 
                    onChange={(e) => setNumber(e.target.value)} 
                />
                
                <Button className="w-full mt-2" type="submit">
                    <span className="flex items-center justify-center gap-2">
                        Start Chat & Pay
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </span>
                </Button>
            </form>
        </div>
    );
}