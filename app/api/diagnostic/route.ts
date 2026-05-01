import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        const { count, error } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });
        return NextResponse.json({ count, error, env: !!process.env.SUPABASE_SERVICE_ROLE_KEY });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
