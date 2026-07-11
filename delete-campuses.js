import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error: err1 } = await supabase.from('volunteers').delete().ilike('campus', '%NCR%');
  if (err1) console.error("Error deleting NCR:", err1);
  else console.log("Deleted NCR volunteers.");

  const { error: err2 } = await supabase.from('volunteers').delete().ilike('campus', '%Lavasa%');
  if (err2) console.error("Error deleting Lavasa:", err2);
  else console.log("Deleted Lavasa volunteers.");
}

run();
