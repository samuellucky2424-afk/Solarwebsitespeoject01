/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { compressImage, validateImage } from '../utils/imageCompression';

// ---------------------------------------------------------------------------
// Runtime config: fetched from /api/config (Vercel serverless function) so
// keys don't need to be baked into the JS bundle via VITE_ env vars.
// Falls back to VITE_ env vars for local development.
// ---------------------------------------------------------------------------

interface AppConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseFunctionUrl: string;
    flutterwavePublicKey: string;
    supportEmail: string;
}

// Module-level state
let _config: AppConfig | null = null;
let _supabase: SupabaseClient | null = null;
let _configPromise: Promise<AppConfig> | null = null;
let _isSupabaseConfigured = false;

// Try to populate immediately from VITE_ env vars (works in local dev)
const viteUrl = import.meta.env.VITE_SUPABASE_URL || '';
const viteKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const viteFuncUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL || '';
const viteFlwKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
const viteSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL || '';

if (viteUrl && viteKey && viteKey !== 'PLACEHOLDER_KEY') {
    // Local dev — VITE_ vars are available at build time
    _config = {
        supabaseUrl: viteUrl,
        supabaseAnonKey: viteKey,
        supabaseFunctionUrl: viteFuncUrl,
        flutterwavePublicKey: viteFlwKey,
        supportEmail: viteSupportEmail,
    };
    _supabase = createClient(viteUrl, viteKey);
    _isSupabaseConfigured = true;
}

/**
 * Fetch runtime config from the backend. Caches the result so only one
 * network call is ever made.
 */
export async function loadConfig(): Promise<AppConfig> {
    if (_config) return _config;

    if (!_configPromise) {
        _configPromise = (async () => {
            try {
                const res = await fetch('/api/config');
                if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
                const data: AppConfig = await res.json();

                if (data.supabaseUrl && data.supabaseAnonKey) {
                    _config = data;
                    _supabase = createClient(data.supabaseUrl, data.supabaseAnonKey);
                    _isSupabaseConfigured = true;
                } else {
                    console.warn('⚠️ Supabase config from /api/config is incomplete. Features requiring database access will fail. Please check your Vercel Environment Variables.');
                    // Create a non-functional client so imports don't crash
                    _config = data;
                    _supabase = createClient(data.supabaseUrl || 'https://placeholder.supabase.co', data.supabaseAnonKey || 'PLACEHOLDER_KEY');
                }
            } catch (err) {
                console.warn('⚠️ Could not fetch /api/config, falling back to placeholder.', err);
                _config = {
                    supabaseUrl: '',
                    supabaseAnonKey: '',
                    supabaseFunctionUrl: '',
                    flutterwavePublicKey: '',
                    supportEmail: viteSupportEmail,
                };
                _supabase = createClient('https://placeholder.supabase.co', 'PLACEHOLDER_KEY');
            }
            return _config;
        })();
    }

    return _configPromise;
}

/**
 * Returns true once we know Supabase has real credentials.
 * Before loadConfig() resolves this may be false on Vercel.
 */
export function getIsSupabaseConfigured(): boolean {
    return _isSupabaseConfigured;
}

// Legacy named export — kept for backward compat with code that reads it
// synchronously. After loadConfig() resolves this value is accurate.
export { _isSupabaseConfigured as isSupabaseConfigured };

/**
 * Return the Supabase client. If config has not been loaded yet (Vercel
 * cold-start), this returns a placeholder client; call loadConfig() first
 * for a guaranteed working client.
 */
export function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase;
    // Should not normally happen — loadConfig() is called early in the app
    return createClient('https://placeholder.supabase.co', 'PLACEHOLDER_KEY');
}

// Default export for convenience — a proxy getter is not possible with
// plain JS, so we expose a mutable reference that gets replaced after
// loadConfig().
export let supabase: SupabaseClient = _supabase || createClient(
    viteUrl || 'https://placeholder.supabase.co',
    viteKey || 'PLACEHOLDER_KEY'
);

/**
 * Return the runtime config. Returns null before loadConfig() resolves.
 */
export function getConfig(): AppConfig | null {
    return _config;
}

export function getSupportEmail(): string {
    return (_config?.supportEmail || viteSupportEmail || '').trim();
}

// Kick off config loading immediately on module load so it resolves ASAP.
loadConfig().then(() => {
    // Replace the module-level export with the real client
    supabase = _supabase!;
});

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
