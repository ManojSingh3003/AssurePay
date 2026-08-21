"use client";
import { useState, ChangeEvent } from "react";
import { Card, TextInput, Button, Loader, Modal } from "@repo/ui";
import { updateProfileInfo, updateProfilePicture, setTransactionPin, checkHasPin, changeTransactionPin } from "../lib/actions/profile"; 
import { AddMoneyCard } from "./AddMoneyCard";
import { WithdrawCard } from "./WithdrawCard";
import { clearAllNotifications, markNotificationsAsRead } from "../lib/actions/notifications";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

type NotificationType = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export default function ProfileDashboardView({ userData, initialNotifications = [] }: { userData: Record<string, any>, initialNotifications?: NotificationType[] }) {
  const [isEd, setIsEd] = useState(false);
  const [ld, setLd] = useState(false);
  const [err, setErr] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();
  
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");

  useEffect(() => {
    checkHasPin().then(setHasPin);
  }, []);
  
  const [form, setForm] = useState({
    name: userData.name || "",
    number: userData.number || "",
    email: userData.email || "",
    panNumber: userData.panNumber || "",
    dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : "",
  });
  
  const [avatar, setAvatar] = useState(userData.profilePicture || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    if (ld) return; 
    setErr("");
    
    if (!form.name?.trim() || !form.email?.trim() || !form.dob?.trim()) {
      setErr("Name, Email, and DOB required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Invalid email.");
      return;
    }

    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
      setErr("Invalid PAN.");
      return;
    }

    setLd(true);
    
    const res = await updateProfileInfo({
      name: form.name,
      email: form.email,
      panNumber: form.panNumber,
      dob: form.dob,
    });
    
    if (res.success) setIsEd(false);
    else setErr(res.message);
    
    setLd(false);
  };

  const handleChg = (fld: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [fld]: e.target.value });
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    await markNotificationsAsRead();
    setNotifications(notifications.map((n: NotificationType) => ({ ...n, isRead: true })));
    router.refresh();
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      await updateProfilePicture(base64);
      router.refresh();
    };
    reader.readAsDataURL(file);
  };

  const handleSetPin = async () => {
    setPinErr("");
    setPinSuccess("");
    
    if (hasPin) {
      if (oldPinInput.length !== 4 || pinInput.length !== 4 || confirmPinInput.length !== 4) {
        setPinErr("All PIN fields must be exactly 4 digits.");
        return;
      }
      if (pinInput !== confirmPinInput) {
        setPinErr("New PIN and Confirm PIN do not match.");
        return;
      }
      const res = await changeTransactionPin(oldPinInput, pinInput);
      if (res.success) {
        setPinSuccess("PIN changed successfully!");
        setPinInput("");
        setOldPinInput("");
        setConfirmPinInput("");
        setTimeout(() => {
          setShowPinModal(false);
          setPinSuccess("");
        }, 1500);
      } else {
        setPinErr(res.message);
      }
    } else {
      if (pinInput.length !== 4 || isNaN(Number(pinInput))) {
        setPinErr("PIN must be exactly 4 digits.");
        return;
      }
      const res = await setTransactionPin(pinInput);
      if (res.success) {
        setPinSuccess("PIN set successfully!");
        setHasPin(true);
        setPinInput("");
        setTimeout(() => {
          setShowPinModal(false);
          setPinSuccess("");
        }, 1500);
      } else {
        setPinErr(res.message);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 lg:p-8 transition-colors relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] ambient-glow opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-1000"></div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div className="flex flex-col">
          <Card title="Profile">
            <div className="flex flex-col items-center border-b pb-6 mb-6">
              <div 
                className="w-24 h-24 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center text-4xl font-bold mb-3 shadow-inner cursor-pointer relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  form.name ? form.name.charAt(0).toUpperCase() : "?"
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-200">{form.name}</h2>
              <div className="flex gap-4 mt-2">
                 <button onClick={() => setIsEd(!isEd)} className="text-[#00B4D8] hover:text-[#0092B0] font-semibold text-sm transition-colors">
                   {isEd ? "Cancel Edit" : "✏️ Edit Profile"}
                 </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Personal Info</h3>
              
              {err && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4 font-medium border border-red-100">{err}</div>}

              <TextInput 
                label="Full Name" 
                value={form.name} 
                disabled={!isEd} 
                onChange={handleChg("name")} 
              />
              <TextInput 
                label="Phone Number" 
                value={form.number} 
                disabled={true} 
                onChange={() => {}} 
              />
              <TextInput 
                label="Email" 
                value={form.email} 
                disabled={!isEd} 
                onChange={handleChg("email")} 
              />
              <TextInput 
                label="Date of Birth (YYYY-MM-DD)" 
                value={form.dob || ""} 
                disabled={!isEd} 
                onChange={handleChg("dob")} 
              />
               <TextInput 
                label="PAN Number" 
                value={form.panNumber} 
                disabled={!isEd} 
                onChange={handleChg("panNumber")} 
              />

              {isEd && (
                <div className="mt-6 flex justify-end">
                   <Button variant="primary" onClick={save}>
                     {ld ? (
                       <div className="flex items-center gap-2">
                         <Loader size="sm" />
                         <span>Saving...</span>
                       </div>
                     ) : (
                       "Save Changes"
                     )}
                   </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center border-b pb-2 mb-6 text-sm font-medium text-gray-400">
             <span className="text-[#00B4D8] border-b-2 border-[#00B4D8] pb-2 font-bold">Notifications</span>
             <div className="flex gap-2 pb-2">
                <button onClick={handleMarkAllRead} className="text-xs text-[#00B4D8] hover:underline font-medium">Mark Read</button>
                <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline font-medium ml-2">Clear All</button>
             </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-zinc-800 flex flex-col gap-4 mb-8 transition-colors">
            {notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <p className="text-sm">You have no new notifications.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {notifications.map((notif: NotificationType) => (
                        <div key={notif.id} className={`p-4 rounded-2xl border flex gap-4 items-start ${notif.isRead ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-[#00B4D8]/5 border-[#00B4D8]/20'}`}>
                            <div className="mt-1">
                                {notif.type === 'TRANSFER' && (
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">₹</div>
                                )}
                                {notif.type === 'MESSAGE' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    </div>
                                )}
                                {notif.type === 'SYSTEM' && (
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h5 className="font-bold text-sm text-[#0B0B0B]">{notif.title}</h5>
                                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="flex gap-6 border-b pb-2 mb-6 text-sm font-medium text-gray-400">
             <span className="text-[#00B4D8] border-b-2 border-[#00B4D8] pb-2 font-bold">Activity & Actions</span>
          </div>
          
          <div className="space-y-4">
             <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-zinc-800 flex flex-col gap-4 transition-colors">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-200">Manage Funds</h3>
                <p className="text-sm text-gray-500 mb-2">Instantly add money to your wallet from your bank, or withdraw it back.</p>
                <div className="flex gap-4">
                  <Button variant="primary" onClick={() => setShowAddMoney(true)}>
                    + Add Money
                  </Button>
                  <Button variant="secondary" onClick={() => setShowWithdraw(true)}>
                    - Withdraw
                  </Button>
                </div>
             </div>

             <div className="bg-[#00B4D8]/5 p-6 rounded-3xl border border-[#00B4D8]/20 mt-4 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00B4D8]/20 flex items-center justify-center text-[#00B4D8]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-300">Security</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-500 mt-1">Transaction PIN protects your money.</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => {
                  setPinErr("");
                  setPinSuccess("");
                  setPinInput("");
                  setOldPinInput("");
                  setConfirmPinInput("");
                  setShowPinModal(true);
                }}>
                  {hasPin ? "Change PIN" : "Set PIN"}
                </Button>
             </div>

          </div>
        </div>
      </div>

      <Modal isOpen={showAddMoney} onClose={() => setShowAddMoney(false)}>
         <AddMoneyCard />
      </Modal>

      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)}>
         <WithdrawCard userPhone={userData.number} />
      </Modal>

      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)}>
        <div className="p-6 text-center bg-white dark:bg-transparent rounded-2xl">
           <div className="w-16 h-16 bg-[#00B4D8]/10 text-[#00B4D8] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           </div>
           <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-200 mb-2">{hasPin ? "Change Security PIN" : "Set Security PIN"}</h2>
           <p className="text-sm text-zinc-600 dark:text-zinc-500 mb-6">
             {hasPin ? "Enter your old PIN to set a new one." : "Create a 4-digit PIN to secure your transactions."}
           </p>
           
           {pinErr && <div className="text-red-500 text-sm mb-4 font-medium">{pinErr}</div>}
           {pinSuccess && <div className="text-green-500 text-sm mb-4 font-medium">{pinSuccess}</div>}

           {hasPin ? (
             <div className="flex flex-col gap-4 mb-6">
               <div className="text-left">
                 <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">Old PIN</label>
                 <input 
                   type="password" 
                   maxLength={4} 
                   value={oldPinInput}
                   onChange={(e) => setOldPinInput(e.target.value)}
                   className="w-full text-center text-2xl tracking-[1em] font-bold py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#00B4D8] focus:ring-0 transition-colors"
                   placeholder="••••"
                 />
               </div>
               <div className="text-left">
                 <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">New PIN</label>
                 <input 
                   type="password" 
                   maxLength={4} 
                   value={pinInput}
                   onChange={(e) => setPinInput(e.target.value)}
                   className="w-full text-center text-2xl tracking-[1em] font-bold py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#00B4D8] focus:ring-0 transition-colors"
                   placeholder="••••"
                 />
               </div>
               <div className="text-left">
                 <label className="block text-sm font-medium text-gray-700 mb-1 pl-1">Confirm New PIN</label>
                 <input 
                   type="password" 
                   maxLength={4} 
                   value={confirmPinInput}
                   onChange={(e) => setConfirmPinInput(e.target.value)}
                   className="w-full text-center text-2xl tracking-[1em] font-bold py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#00B4D8] focus:ring-0 transition-colors"
                   placeholder="••••"
                 />
               </div>
             </div>
           ) : (
             <div className="mb-6">
               <input 
                 type="password" 
                 maxLength={4} 
                 value={pinInput}
                 onChange={(e) => setPinInput(e.target.value)}
                 className="w-full text-center text-4xl tracking-[1em] font-bold py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#00B4D8] focus:ring-0 transition-colors"
                 placeholder="••••"
               />
             </div>
           )}
           
           <Button variant="primary" onClick={handleSetPin}>Confirm PIN</Button>
        </div>
      </Modal>
    </div>
  );
}