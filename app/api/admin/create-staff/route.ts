import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
    console.log("POST /api/admin/create-staff initiated");

    // Safety timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
            () => reject(new Error("Request timed out after 10 seconds")),
            10000,
        );
    });

    try {
        const body = await req.json();
        const {
            fullName,
            email,
            designation,
            password,
            username,
            role = "staff",
            isManager = false,
            hasManagerAccess = false,
            redirect: bodyRedirect,
        } = body;

        // Determine if this is a sales staff member
        const redirect = bodyRedirect || (role === "sales" ? "sales" : "staff");
        const isSalesStaff = redirect === "sales" || role === "sales";

        const mainLogic = (async () => {
            if (!fullName || !email || !designation || !password || !username) {
                return { error: "Missing required fields", status: 400 };
            }

            // Use provided username
            const generatedUsername = username
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9.]/g, "");
            console.log("Creating staff member:", {
                email,
                generatedUsername,
                role,
                isSalesStaff,
            });

            // 1. Create Auth User
            console.log("Step 1: Creating Auth user...");
            const { data: authData, error: authError } =
                await supabaseAdmin.auth.admin.createUser({
                    email: email.trim(),
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: fullName,
                        role: role,
                        designation,
                        username: generatedUsername,
                        redirect: redirect,
                        is_sales_staff: isSalesStaff,
                    },
                });

            if (authError) throw new Error(`Auth Error: ${authError.message}`);

            const user = authData?.user;
            if (!user) throw new Error("Failed to create user object");
            console.log("Auth user created successfully:", user.id);

            // 2. Create Profile
            console.log("Step 2: Creating profile...");
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .insert({
                    id: user.id,
                    email: email.toLowerCase().trim(),
                    username: generatedUsername,
                    full_name: fullName.trim(),
                    role: isSalesStaff ? "sales" : role,
                    department: isSalesStaff ? "sales" : designation.trim(),
                    is_sales_staff: isSalesStaff,
                    is_manager: hasManagerAccess,
                    password: password, // Store password in profiles table
                });

            if (profileError) {
                console.error("Profile insertion failed:", profileError);
                await supabaseAdmin.auth.admin.deleteUser(user.id);
                throw new Error(`Database Error: ${profileError.message}`);
            }
            console.log("Profile created successfully");

            // 3. Log Activity
            try {
                await supabaseAdmin.from("activity_feed").insert({
                    action_type: "create_staff",
                    description: `Staff account added: ${fullName} (@${generatedUsername}) - ${isSalesStaff ? "Sales Staff" : hasManagerAccess ? "Manager" : "Staff"}`,
                    user_id: user.id,
                });
            } catch (actErr) {
                console.warn("Log failed", actErr);
            }

            return {
                success: true,
                email,
                username: generatedUsername,
                userId: user.id,
                isSalesStaff: isSalesStaff,
                redirect: redirect,
                status: 201,
            };
        })();

        const result: any = await Promise.race([mainLogic, timeoutPromise]);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: result.status },
            );
        }

        return NextResponse.json(result, { status: result.status || 201 });
    } catch (err: any) {
        console.error("Critical error in create-staff route:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 },
        );
    }
}
