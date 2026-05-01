import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";

// Upload a file to a public bucket and return the public URL
export async function uploadPublicFile(
    bucket: string,
    path: string,
    file: File,
) {
    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

// Create a signed URL for a private object (server-side via admin client)
export async function createSignedUrl(
    bucket: string,
    path: string,
    expires = 60,
) {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, expires);
    if (error) throw error;
    return data.signedUrl;
}

// Delete object (admin)
export async function removeObject(bucket: string, path: string) {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);
    if (error) throw error;
    return data;
}
