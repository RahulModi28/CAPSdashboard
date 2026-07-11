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
  console.log("Clearing mock data from Supabase...");

  // Delete all email_logs
  const { error: err1 } = await supabase.from('email_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err1) console.error("Error clearing email_logs:", err1.message);
  else console.log("Cleared all email_logs.");

  // Delete all email_triggers
  const { error: err2 } = await supabase.from('email_triggers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err2) console.error("Error clearing email_triggers:", err2.message);
  else console.log("Cleared all email_triggers.");

  // Delete all volunteers
  const { error: err3 } = await supabase.from('volunteers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (err3) console.error("Error clearing volunteers:", err3.message);
  else console.log("Cleared all volunteers.");

  console.log("Database is now empty and ready for real data!");
}

run();
