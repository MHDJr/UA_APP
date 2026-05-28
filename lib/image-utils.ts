/**
 * Image processing utility for client-side compression and resizing.
 * Ensures images stay under 500KB and 1200px max dimension.
 */

export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxFileSizeKB?: number;
    outputFormat?: "image/webp" | "image/jpeg";
}

const DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    maxFileSizeKB: 500,
    outputFormat: "image/webp",
};

/**
 * Compresses and resizes an image file.
 * Returns a Blob or throws an error if compression fails to meet size requirements.
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 1. Create an Image object from the file
    const img = await fileToImage(file);

    // 2. Calculate new dimensions
    let { width, height } = img;
    if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
    }

    // 3. Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    ctx.drawImage(img, 0, 0, width, height);

    // 4. Export to Blob
    let quality = opts.quality!;
    let blob = await canvasToBlob(canvas, opts.outputFormat!, quality);

    // 5. Iterative compression if file size is still too large
    while (blob.size > opts.maxFileSizeKB! * 1024 && quality > 0.1) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, opts.outputFormat!, quality);
    }

    if (blob.size > opts.maxFileSizeKB! * 1024) {
        throw new Error(
            `Image is too large (${(blob.size / 1024).toFixed(
                1
            )}KB) even after maximum compression. Please use a smaller source image.`
        );
    }

    return blob;
}

function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: string,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas to Blob conversion failed"));
            },
            format,
            quality
        );
    });
}
