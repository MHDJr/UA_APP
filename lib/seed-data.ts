import { supabase } from "./supabase";

export async function seedDemoData(userId: string, userRole: "ceo" | "staff") {
    // Seed CEO user if not exists
    const ceoEmail = "saleemsaquafi@gmail.com";
    const ceoPassword = "Bismillah&786";
    const ceoName = "Saleem Pa";

    const { data: existingCEO } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", ceoEmail)
        .maybeSingle();

    if (!existingCEO) {
        try {
            const { data: authUser } = await supabase.auth.signUp({
                email: ceoEmail,
                password: ceoPassword,
                options: {
                    data: {
                        full_name: ceoName,
                    },
                },
            });

            if (authUser.user) {
                await supabase.from("profiles").insert({
                    id: authUser.user.id,
                    email: ceoEmail,
                    full_name: ceoName,
                    role: "ceo",
                    status: "online",
                    ceo_door_status: "open",
                });
            }
        } catch (error) {
            console.error("Error seeding CEO:", error);
        }
    }

    if (userRole === "ceo") {
        const staffMembers = [
            {
                full_name: "Sarah Johnson",
                email: "sarah@usthad.com",
                department: "Engineering",
                phone: "+1-555-0101",
            },
            {
                full_name: "Michael Chen",
                email: "michael@usthad.com",
                department: "Marketing",
                phone: "+1-555-0102",
            },
            {
                full_name: "Emily Rodriguez",
                email: "emily@usthad.com",
                department: "Sales",
                phone: "+1-555-0103",
            },
            {
                full_name: "David Kim",
                email: "david@usthad.com",
                department: "Support",
                phone: "+1-555-0104",
            },
            {
                full_name: "Jessica Lee",
                email: "jessica@usthad.com",
                department: "HR",
                phone: "+1-555-0105",
            },
            {
                full_name: "Robert Martinez",
                email: "robert@usthad.com",
                department: "Engineering",
                phone: "+1-555-0106",
            },
        ];

        for (const member of staffMembers) {
            const { data: existingUser } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", member.email)
                .maybeSingle();

            if (!existingUser) {
                const { data: authUser } = await supabase.auth.signUp({
                    email: member.email,
                    password: "demo123",
                    options: {
                        data: {
                            full_name: member.full_name,
                        },
                    },
                });

                if (authUser.user) {
                    await supabase.from("profiles").insert({
                        id: authUser.user.id,
                        email: member.email,
                        full_name: member.full_name,
                        role: "staff",
                        department: member.department,
                        phone: member.phone,
                        status: ["online", "busy", "away"][
                            Math.floor(Math.random() * 3)
                        ],
                    });

                    await supabase.from("tasks").insert({
                        assigned_to: authUser.user.id,
                        title: `Review ${member.department} quarterly report`,
                        description:
                            "Please complete the quarterly review and submit your findings",
                        priority: ["low", "medium", "high"][
                            Math.floor(Math.random() * 3)
                        ],
                        created_by: userId,
                        due_date: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                    });
                }
            }
        }

        await supabase.from("activity_feed").insert([
            {
                action_type: "system",
                description: "CEO Command Center initialized",
                user_id: userId,
            },
        ]);

        return true;
    }

    return false;
}
