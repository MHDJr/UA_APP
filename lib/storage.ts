import { supabase } from "./supabase";

// Upload a file to a public bucket and return the public URL
export async function uploadPublicFile(
    bucket: string,
    path: string,
    file: File | Blob,
) {
    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { 
            upsert: true,
            contentType: file.type || 'image/webp'
        });
        
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Deletes a file from a bucket using its public URL or path
 */
export async function deleteFile(bucket: string, pathOrUrl: string) {
    const path = extractPathFromUrl(pathOrUrl);
    const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);
        
    if (error) {
        console.error(`Error deleting file from ${bucket}:`, error);
        throw error;
    }
    return data;
}

/**
 * Extracts the storage path from a Supabase public URL
 */
export function extractPathFromUrl(url: string): string {
    if (!url || !url.includes('/storage/v1/object/public/')) return url;
    try {
        const parts = url.split('/storage/v1/object/public/');
        if (parts.length < 2) return url;
        
        // Remove the bucket name (first part after 'public/')
        const pathWithBucket = parts[1];
        const bucketMatch = pathWithBucket.match(/^([^\/]+)\/(.*)$/);
        return bucketMatch ? bucketMatch[2] : pathWithBucket;
    } catch (e) {
        return url;
    }
}
