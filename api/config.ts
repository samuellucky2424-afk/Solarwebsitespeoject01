/**
 * API Endpoint to serve Supabase config at runtime.
 * This removes the need for VITE_ prefixed env vars on Vercel,
 * since the config is fetched from the backend at runtime instead
 * of being baked into the frontend JS bundle at build time.
 *
 * Environment variables required on Vercel (NO VITE_ prefix):
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_FUNCTION_URL
 *   FLUTTERWAVE_PUBLIC_KEY
 */
export default function handler(req: any, res: any) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set cache headers — config rarely changes but must be fresh on redeploy
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseFunctionUrl: process.env.SUPABASE_FUNCTION_URL || '',
    flutterwavePublicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  });
}
