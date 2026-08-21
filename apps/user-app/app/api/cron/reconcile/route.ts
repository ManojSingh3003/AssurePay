import { NextResponse } from "next/server";
import { reconcileTransactions } from "../../../../lib/actions/reconcileTransactions";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        const secret = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        // Verify the cron secret
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
        }

        // Trigger the reconciliation process for ALL users
        const result = await reconcileTransactions();

        return NextResponse.json(result, { status: 200 });

    } catch (e) {
        console.error("Cron Reconciliation Error:", e);
        return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
    }
}
