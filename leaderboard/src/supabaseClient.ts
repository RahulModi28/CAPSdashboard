import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axgxzzdgujjdpkggwpod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4Z3h6emRndWpqZHBrZ2d3cG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTU0NDUsImV4cCI6MjA5OTI3MTQ0NX0.avW7zwKmmj-3hkG3Fz9CGQM6F7HC-m9SxhNWpu3LM2I';

export const supabase = createClient(supabaseUrl, supabaseKey);
