/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { compressImage, validateImage } from '../utils/imageCompression';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqvapaavywmqswtccfqu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseKey && supabaseKey !== 'PLACEHOLDER_KEY';

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase Key is missing or is a placeholder! Features requiring database access will fail. Please check your Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey || 'PLACEHOLDER_KEY');

export const uploadImage = async (file: File, bucket: string = 'greenlife-assets', folder: string = 'uploads'): Promise<{ url: string | null, error: string | null }> => {
    try {
        const validationError = validateImage(file);
        if (validationError) {
            console.error("Image validation failed:", validationError);
            return { url: null, error: validationError };
        }

        const compressedFile = await compressImage(file);
        const fileName = `${Date.now()}.webp`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedFile, {
                contentType: 'image/webp',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return { url: null, error: 'Storage error: ' + error.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { url: publicUrl, error: null };
    } catch (error: any) {
        console.error('Upload exception:', error);
        return { url: null, error: error.message || 'Unknown upload error' };
    }
};
