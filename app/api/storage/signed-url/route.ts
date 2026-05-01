import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const path = url.searchParams.get("path");
        const bucket = url.searchParams.get("bucket") || "uploads";
        const expires = parseInt(url.searchParams.get("expires") || "60", 10);

        if (!path) {
            return NextResponse.json(
                { error: "missing path" },
                { status: 400 },
            );
        }

        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, expires);
        if (error)
            return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || String(err) },
            { status: 500 },
        );
    }
}
