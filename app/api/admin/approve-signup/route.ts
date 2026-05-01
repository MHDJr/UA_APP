import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function generatePassword() {
    const rand = Math.random().toString(36).slice(2, 8);
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${rand}${num}`;
}

export async function POST(req: Request) {
    try {
        const {
            requestId,
            password,
            role = "staff",
            designation,
        } = await req.json();

        if (!requestId) {
            return NextResponse.json(
                { error: "Request ID is required" },
                { status: 400 },
            );
        }

        // Fetch the signup request
        const { data: signupRequest, error: fetchError } = await supabaseAdmin
            .from("signup_requests")
            .select("*")
            .eq("id", requestId)
            .eq("status", "pending")
            .maybeSingle();

        if (fetchError) {
            return NextResponse.json(
                { error: fetchError.message },
                { status: 500 },
            );
        }

        if (!signupRequest) {
            return NextResponse.json(
                { error: "Signup request not found or already processed" },
                { status: 404 },
            );
        }

        const { email, full_name, username } = signupRequest;

        // Use provided password or generate one
        const finalPassword = password || (signupRequest as any).password || generatePassword();

        // Create the user in Supabase Auth
        const { data: authUser, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password: finalPassword,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    username: username || null,
                    role,
                    designation: designation || "",
                },
            });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 500 },
            );
        }

        const user = (authUser as any)?.user;
        if (!user) {
            return NextResponse.json(
                { error: "Failed to create user" },
                { status: 500 },
            );
        }

        // Create the profile with username
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert({
                id: user.id,
                email,
                username: username || null,
                full_name,
                role,
                department: designation || "Staff",
                status: "offline",
                password: finalPassword, // Save password to profiles
            });

        if (profileError) {
            // Try to rollback auth user creation
            await supabaseAdmin.auth.admin.deleteUser(user.id);
            return NextResponse.json(
                { error: profileError.message },
                { status: 500 },
            );
        }

        // Update signup request status to approved
        const { error: updateError } = await supabaseAdmin
            .from("signup_requests")
            .update({
                status: "approved",
            })
            .eq("id", requestId);

        if (updateError) {
            console.error(
                "Failed to update signup request status:",
                updateError,
            );
            // Don't fail the request as user was created
        }

        // Log activity
        await supabaseAdmin.from("activity_feed").insert({
            action_type: "approve_signup",
            description: `Approved signup request for ${full_name} (${username || email}) with role: ${role}${designation ? `, designation: ${designation}` : ""}`,
            user_id: user.id,
        });

        return NextResponse.json(
            {
                message: "Signup request approved successfully",
                user: {
                    id: user.id,
                    email,
                    username: username || null,
                    full_name,
                    role,
                    designation,
                },
                password: finalPassword,
            },
            { status: 200 },
        );
    } catch (err: any) {
        console.error("Approve signup error:", err);
        return NextResponse.json(
            { error: err.message || "An unexpected error occurred" },
            { status: 500 },
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { requestId, reason } = await req.json();

        if (!requestId) {
            return NextResponse.json(
                { error: "Request ID is required" },
                { status: 400 },
            );
        }

        // Fetch the signup request
        const { data: signupRequest, error: fetchError } = await supabaseAdmin
            .from("signup_requests")
            .select("*")
            .eq("id", requestId)
            .maybeSingle();

        if (fetchError) {
            return NextResponse.json(
                { error: fetchError.message },
                { status: 500 },
            );
        }

        if (!signupRequest) {
            return NextResponse.json(
                { error: "Signup request not found" },
                { status: 404 },
            );
        }

        // Update status to rejected
        const { error: updateError } = await supabaseAdmin
            .from("signup_requests")
            .delete()
            .eq("id", requestId);

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 },
            );
        }

        // Log activity
        await supabaseAdmin.from("activity_feed").insert({
            action_type: "reject_signup",
            description: `Rejected signup request for ${signupRequest.full_name} (${signupRequest.username || signupRequest.email})${reason ? `: ${reason}` : ""}`,
        });

        return NextResponse.json(
            {
                message: "Signup request rejected",
            },
            { status: 200 },
        );
    } catch (err: any) {
        console.error("Reject signup error:", err);
        return NextResponse.json(
            { error: err.message || "An unexpected error occurred" },
            { status: 500 },
        );
    }
}
