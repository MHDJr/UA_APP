import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function generateTempPassword() {
    // Generate a secure random password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add a number at the end
    password += Math.floor(1000 + Math.random() * 9000);
    return password;
}

export async function POST(req: Request) {
    try {
        const {
            full_name,
            username,
            email,
            password,
            role = "staff",
        } = await req.json();

        if (!full_name || !email || !password) {
            return NextResponse.json(
                { error: "Full name, email, and password are required" },
                { status: 400 },
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 },
            );
        }

        // Validate username if provided
        if (username) {
            const usernameRegex = /^[a-z0-9.]+$/;
            if (!usernameRegex.test(username)) {
                return NextResponse.json(
                    {
                        error: "Username can only contain lowercase letters, numbers, and periods",
                    },
                    { status: 400 },
                );
            }
        }

        // Check if email already exists in signup_requests
        const { data: existingRequest } = await supabaseAdmin
            .from("signup_requests")
            .select("*")
            .eq("email", email.toLowerCase())
            .in("status", ["pending", "approved"])
            .maybeSingle();

        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return NextResponse.json(
                    {
                        error: "A signup request with this email is already pending approval",
                    },
                    { status: 400 },
                );
            } else {
                return NextResponse.json(
                    {
                        error: "This email has already been approved. Please contact admin.",
                    },
                    { status: 400 },
                );
            }
        }

        // Check if username already exists (if provided)
        if (username) {
            const { data: existingUsername } = await supabaseAdmin
                .from("signup_requests")
                .select("*")
                .eq("username", username.toLowerCase())
                .eq("status", "pending")
                .maybeSingle();

            if (existingUsername) {
                return NextResponse.json(
                    { error: "This username is already taken" },
                    { status: 400 },
                );
            }
        }

        // Check if user already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", email.toLowerCase())
            .maybeSingle();

        if (existingProfile) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 400 },
            );
        }

        // Hash password for storage (we'll use it when CEO approves)
        // For now, we store it temporarily - in production, consider encryption
        const tempPassword = password; // In production, encrypt this!

        // Create signup request
        const { data: signupRequest, error: requestError } = await supabaseAdmin
            .from("signup_requests")
            .insert({
                email: email.toLowerCase(),
                username: username ? username.toLowerCase() : null,
                full_name: full_name.trim(),
                role: role,
                status: "pending",
                password: password // Save the password to use during approval
            })
            .select()
            .single();

        if (requestError) {
            return NextResponse.json(
                { error: requestError.message },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                message:
                    "Signup request submitted successfully! Please wait for CEO approval.",
                request: signupRequest,
            },
            { status: 201 },
        );
    } catch (err: any) {
        console.error("Signup request error:", err);
        return NextResponse.json(
            { error: err.message || "An unexpected error occurred" },
            { status: 500 },
        );
    }
}
