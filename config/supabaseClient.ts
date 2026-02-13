import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqvapaavywmqswtccfqu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'PLACEHOLDER_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: File, bucket: string = 'greenlife-assets', folder: string = 'uploads'): Promise<string | null> => {
    try {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Upload exception:', error);
        return null;
    }
};
