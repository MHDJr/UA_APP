import { supabase } from "./supabase";

export async function getProfile(id: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function upsertProfile(
    profile: Partial<{
        id: string;
        email: string;
        full_name: string;
        role: string;
        avatar_url?: string;
    }>,
) {
    const { data, error } = await supabase.from("profiles").upsert([profile]);
    if (error) throw error;
    return data;
}

export async function listTasksForUser(userId: string) {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
    if (error) throw error;
    return data;
}

export async function createTask(
    task: Partial<{
        assigned_to: string;
        title: string;
        description?: string;
        priority?: string;
        created_by: string;
    }>,
) {
    const { data, error } = await supabase.from("tasks").insert([task]);
    if (error) throw error;
    return data;
}

export async function updateTask(id: string, changes: Record<string, any>) {
    const { data, error } = await supabase
        .from("tasks")
        .update(changes)
        .eq("id", id);
    if (error) throw error;
    return data;
}

export async function deleteTask(id: string) {
    const { data, error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    return data;
}
