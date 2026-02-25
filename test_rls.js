import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
// The service role key may not be in .env but let's just see what anon key returns.

const supabase = createClient(url, anonKey);

async function test() {
    const { data, error } = await supabase.from('greenlife_hub').select('*');
    console.log("Anon Key fetch returned", data?.length || 0, "rows.");
    if (error) console.error("Error:", error);
}

test();
