import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.1, // 100KB target
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/webp",
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}

export function validateImage(file: File): string | null {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Only JPG, JPEG, PNG, and WebP are allowed.';
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
        return 'File size exceeds 10MB limit.';
    }

    return null; // Valid
}
