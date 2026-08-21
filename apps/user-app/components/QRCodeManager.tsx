"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button, Modal } from "@repo/ui";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

export function QRCodeManager({ userPhone }: { userPhone: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"show" | "scan">("show");
    const [merchantCodeInput, setMerchantCodeInput] = useState("");
    const router = useRouter();

    const handleScan = (results: { rawValue: string }[]) => {
        if (results && results.length > 0) {
            const scannedData = results[0]?.rawValue;
            if (scannedData) {
                setIsOpen(false);
                if(scannedData.startsWith("APM-")){
                    router.push(`/merchant/${scannedData}`);
                }else{
                    router.push(`/transfer/${scannedData}`);
                }
            }
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code && code.data) {
                    setIsOpen(false);
                    
                    if(code.data.startsWith("APM-")){
                        router.push(`/merchant/${code.data}`);
                    }else{
                        router.push(`/transfer/${code.data}`);
                    }
                } else {
                    alert("No QR code found. Please upload a clear photo of a QR code only.");
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <>
            <Button variant="secondary" onClick={() => setIsOpen(true)}>
                QR Code / Scan
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="p-6">
                    <div className="flex gap-2 mb-6">
                        <Button 
                            variant={mode === "show" ? "primary" : "secondary"} 
                            onClick={() => setMode("show")}
                        >
                            My QR Code
                        </Button>
                        <Button 
                            variant={mode === "scan" ? "primary" : "secondary"} 
                            onClick={() => setMode("scan")}
                        >
                            Scan to Pay
                        </Button>
                    </div>

                    {mode === "show" && (
                        <div className="flex flex-col items-center justify-center p-8 bg-white border rounded-2xl">
                            <QRCode value={userPhone} size={200} />
                            <p className="mt-6 text-gray-500 font-medium">Scan to pay me directly</p>
                            <p className="text-xl font-bold mt-2">{userPhone}</p>
                        </div>
                    )}

                    {mode === "scan" && (
                        <div className="flex flex-col items-center justify-center">
                            <div className="border rounded-2xl overflow-hidden aspect-square w-full mb-4">
                                <Scanner 
                                    onScan={handleScan} 
                                    formats={['qr_code']}
                                />
                            </div>
                            
                            <div className="w-full relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center mb-4">
                                    <span className="bg-white px-2 text-sm text-gray-500">OR</span>
                                </div>
                            </div>
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Button 
                                variant="secondary" 
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload from Gallery
                            </Button>

                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
