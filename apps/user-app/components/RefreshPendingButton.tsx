"use client";

import { useState } from "react";
import { reconcileTransactions } from "../lib/actions/reconcileTransactions";

export function RefreshPendingButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Reconcile specifically for the logged-in user (but the backend fetches all for simplicity if we want)
            const result = await reconcileTransactions();
            setMessage(result.msg);
            if (result.processed > 0) {
                // Refresh the page to show new balances
                window.location.reload();
            } else {
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (e) {
            setMessage("Failed to refresh");
            setTimeout(() => setMessage(""), 3000);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            {message && <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{message}</span>}
            <button 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-full transition-colors disabled:opacity-50"
            >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? "Syncing..." : "Sync Status"}
            </button>
        </div>
    );
}
