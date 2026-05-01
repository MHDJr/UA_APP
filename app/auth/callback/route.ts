import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
        console.error("OAuth error:", error, error_description);
        return NextResponse.redirect(
            `${origin}?error=${encodeURIComponent(error_description || error)}`,
        );
    }

    if (!code) {
        return NextResponse.redirect(`${origin}?error=No code provided`);
    }

    try {
        // Exchange the code for a session
        const { data, error: exchangeError } =
            await supabaseAdmin.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            return NextResponse.redirect(
                `${origin}?error=${encodeURIComponent(exchangeError.message)}`,
            );
        }

        const user = data.user;
        const session = data.session;

        if (!user || !session) {
            return NextResponse.redirect(
                `${origin}?error=Failed to create session`,
            );
        }

        // Check if profile exists, if not create one
        const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (!existingProfile) {
            // Get user metadata from the OAuth provider
            const fullName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "Google User";

            const ceoEmails = [
                "saleemsaquafi@gmail.com",
                "muhammedpsofficial@gmail.com",
            ];
            const isCeo = user.email && ceoEmails.includes(user.email);

            // Create profile for the new user
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    role: isCeo ? "ceo" : "staff",
                    department: isCeo ? "Executive" : "Staff",
                    status: "online",
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
                // Don't fail the login, just log the error
            }

            // Log activity
            await supabaseAdmin.from("activity_feed").insert({
                action_type: "google_signup",
                description: `User ${fullName} signed up via Google OAuth`,
                user_id: user.id,
            });
        } else {
            // Update online status for existing user
            await supabaseAdmin
                .from("profiles")
                .update({ status: "online" })
                .eq("id", user.id);

            // Log activity
            await supabaseAdmin.from("activity_feed").insert({
                action_type: "google_login",
                description: `User ${existingProfile.full_name} logged in via Google`,
                user_id: user.id,
            });
        }

        // Determine redirect URL based on role
        let finalRole = existingProfile?.role;

        if (!existingProfile) {
            finalRole =
                user.email &&
                [
                    "saleemsaquafi@gmail.com",
                    "muhammedpsofficial@gmail.com",
                ].includes(user.email)
                    ? "ceo"
                    : "staff";
        }

        // Redirect with role parameter for both CEO and staff
        const redirectPath =
            finalRole === "ceo" ? "/?role=ceo" : "/?role=staff";

        // Create response with redirect
        const response = NextResponse.redirect(`${origin}${redirectPath}`);

        // Set auth cookies
        // We set secure: false for development to ensure it works on localhost
        const isProd = process.env.NODE_ENV === "production";

        response.cookies.set("sb-access-token", session.access_token, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            secure: isProd,
        });
        response.cookies.set("sb-refresh-token", session.refresh_token, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            secure: isProd,
        });

        return response;
    } catch (err: any) {
        console.error("Callback error:", err);
        return NextResponse.redirect(
            `${origin}?error=${encodeURIComponent(err.message || "Authentication failed")}`,
        );
    }
}
