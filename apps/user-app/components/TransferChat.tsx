"use client";

import { useState } from "react";
import { Button, TextInput, Modal } from "@repo/ui";
import { motion } from "motion/react";
import { sendTextMessage } from "../lib/actions/chat";
import { p2pTransfer } from "../lib/actions/p2pTransfers";
import { useRouter } from "next/navigation";

type Message = {
    id: number;
    content: string | null;
    fromUserId: number;
    timestamp: Date;
    transferId?: number | null;
    transfer?: { amount: number };
};

interface TransferChatProps {
    initialMessages: Message[];
    targetUserId: number;
    targetUserNumber: string;
    currentUserId: number;
}

export function TransferChat({ 
    initialMessages, 
    targetUserId, 
    targetUserNumber,
    currentUserId 
}: TransferChatProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [text, setText] = useState("");
    const [showPayModal, setShowPayModal] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

       
        const newMsg = {
            id: Math.random(),
            content: text,
            fromUserId: currentUserId,
            timestamp: new Date()
        };
        setMessages((prev: Message[]) => [...prev, newMsg as Message]);
        setText("");

        await sendTextMessage(targetUserId, text);
        router.refresh(); 
    };

    const handleSendMoney = async () => {
        if (!payAmount) return;
        if (pin.length !== 4) {
            alert("Please enter a valid 4-digit PIN.");
            return;
        }

        setLoading(true);
        
        const res = await p2pTransfer(targetUserNumber, Number(payAmount) * 100, pin);
        if (res.success) {
            setShowPayModal(false);
            setPayAmount("");
            setPin("");
            router.refresh(); 
        } else {
            if (res.message === "PIN_REQUIRED") {
                alert("Please set up a Transaction PIN in your Profile first.");
                router.push("/profile");
            } else {
                alert(res.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950/80 backdrop-blur-lg rounded-xl border dark:border-zinc-800 overflow-hidden transition-colors dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-500 gap-4 opacity-70">
                        <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <p className="text-lg font-medium">No messages yet</p>
                        <p className="text-sm max-w-xs">Send a message or payment to start a secure conversation.</p>
                    </div>
                )}
                {messages.map((msg: Message) => {
                    const isMe = msg.fromUserId === currentUserId;
                    const isPayment = !!msg.transferId;

                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            key={msg.id} 
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            {isPayment ? (
                                <div className={`p-4 rounded-2xl border min-w-[200px] shadow-sm transition-colors ${isMe ? 'bg-white dark:bg-zinc-900/60 backdrop-blur-md border-blue-200 dark:border-[#00B4D8]/30' : 'bg-white dark:bg-zinc-900/40 backdrop-blur-md border-gray-200 dark:border-zinc-800'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">₹</div>
                                        <span className="font-bold text-lg dark:text-zinc-200">₹{((msg.transfer?.amount || 0) / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">{isMe ? 'You paid' : 'Paid you'}</div>
                                </div>
                            ) : (
                                <div className={`px-5 py-3 rounded-2xl max-w-[70%] shadow-sm transition-colors ${isMe ? 'bg-[#00B4D8] text-white rounded-br-sm shadow-[0_0_15px_rgba(0,180,216,0.2)]' : 'bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-gray-100 dark:border-zinc-800 text-black dark:text-zinc-300 rounded-bl-sm'}`}>
                                    {msg.content}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white dark:bg-zinc-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800 flex gap-2 transition-colors">
                <Button variant="secondary" onClick={() => setShowPayModal(true)}>
                    ₹ Pay
                </Button>
                <form onSubmit={handleSendText} className="flex-1 flex gap-2">
                    <input 
                        type="text" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm dark:text-zinc-300 rounded-full px-5 outline-none focus:border-[#00B4D8] dark:focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] transition-colors"
                    />
                    <Button type="submit">Send</Button>
                </form>
            </div>

            {/* Pay Modal */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)}>
                <div className="p-6 bg-white dark:bg-transparent rounded-2xl transition-colors">
                    <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-200">Pay {targetUserNumber}</h2>
                    <TextInput 
                        label="Amount (₹)" 
                        placeholder="0" 
                        type="number"
                        onChange={(e) => setPayAmount(e.target.value)} 
                    />
                    
                    <div className="mt-4">
                        <label className="block text-sm text-zinc-700 dark:text-zinc-500 font-bold mb-2">Transaction PIN</label>
                        <input 
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full text-center text-2xl tracking-[1em] font-bold py-3 bg-gray-50 dark:bg-zinc-950/50 border-2 border-gray-100 dark:border-zinc-800 dark:text-zinc-300 rounded-xl focus:border-[#00B4D8] dark:focus:border-[#00B4D8] focus:ring-0 transition-colors outline-none"
                            placeholder="••••"
                        />
                    </div>

                    <Button className="w-full mt-6" onClick={handleSendMoney} disabled={loading}>
                        {loading ? "Processing..." : "Send Securely"}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
