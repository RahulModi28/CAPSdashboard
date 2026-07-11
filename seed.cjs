const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mockVolunteers = [
  // Boys
  { reg_no: "2524443", name: "Aarav Sharma",    campus: "Bangalore Central Campus",    room: "A-101", partner_name: "Rohan Desai",    keys_collected: true, email: "aarav@example.com" },
  { reg_no: "2524444", name: "Rohan Desai",     campus: "Bangalore Central Campus",    room: "A-101", partner_name: "Aarav Sharma",   keys_collected: true, email: "rohan@example.com" },
  { reg_no: "2524445", name: "Karan Patel",     campus: "Bangalore BGR Campus",        room: "B-204", partner_name: "Mihir Nair",     keys_collected: false, email: "karan@example.com" },
  { reg_no: "2524446", name: "Mihir Nair",      campus: "Bangalore BGR Campus",        room: "B-204", partner_name: "Karan Patel",    keys_collected: false, email: "mihir@example.com" },
  { reg_no: "2524447", name: "Ishaan Malhotra", campus: "Bangalore Kengeri Campus",    room: "C-312", partner_name: "Aditya Bose",    keys_collected: true, email: "ishaan@example.com" },
  { reg_no: "2524448", name: "Aditya Bose",     campus: "Bangalore Kengeri Campus",    room: "C-312", partner_name: "Ishaan Malhotra",keys_collected: true, email: "aditya@example.com" },
  { reg_no: "2524449", name: "Varun Tiwari",    campus: "Bangalore Yeshwanthpur",      room: "D-108", partner_name: "Siddharth Roy",  keys_collected: false, email: "varun@example.com" },
  { reg_no: "2524450", name: "Siddharth Roy",   campus: "Bangalore Yeshwanthpur",      room: "D-108", partner_name: "Varun Tiwari",   keys_collected: false, email: "siddharth@example.com" },
  { reg_no: "2524451", name: "Arjun Kapoor",    campus: "Bangalore Central Campus",    room: "E-215", partner_name: "Rahul Kumar",    keys_collected: true, email: "arjun@example.com" },
  { reg_no: "2524452", name: "Rahul Kumar",     campus: "Bangalore Central Campus",    room: "E-215", partner_name: "Arjun Kapoor",   keys_collected: true, email: "rmodi182@gmail.com" }, // Assigned the requested email here!

  // Girls
  { reg_no: "2524453", name: "Sneha Kulkarni",  campus: "Bangalore Central Campus",    room: "A-203", partner_name: "Anjali Verma",   keys_collected: false, email: "sneha@example.com" },
  { reg_no: "2524454", name: "Anjali Verma",    campus: "Bangalore Central Campus",    room: "A-203", partner_name: "Sneha Kulkarni", keys_collected: true, email: "anjali@example.com" },

  { reg_no: "2524457", name: "Nisha Gupta",     campus: "Bangalore BGR Campus",        room: "B-307", partner_name: "Riya Singh",     keys_collected: true, email: "nisha@example.com" },
  { reg_no: "2524458", name: "Riya Singh",      campus: "Bangalore BGR Campus",        room: "B-307", partner_name: "Nisha Gupta",    keys_collected: true, email: "riya@example.com" },
  { reg_no: "2524459", name: "Meera Iyer",      campus: "Bangalore Kengeri Campus",    room: "C-405", partner_name: "Pooja Reddy",    keys_collected: false, email: "meera@example.com" },
  { reg_no: "2524460", name: "Pooja Reddy",     campus: "Bangalore Kengeri Campus",    room: "C-405", partner_name: "Meera Iyer",     keys_collected: false, email: "pooja@example.com" },
];

const mockEmails = [
  { id: "EML-001", recipient_name: "Priya Mehta", recipient_email: "priya.mehta@example.com", subject: "Your Key Card is Ready", status: "sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), volunteer_reg_no: null },
  { id: "EML-002", recipient_name: "Rohan Desai", recipient_email: "rohan.desai@example.com", subject: "Action Required: Registration Pending", status: "pending", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), volunteer_reg_no: "2524444" },
  { id: "EML-003", recipient_name: "Sneha Kulkarni", recipient_email: "sneha.k@example.com", subject: "Your Roommate Has Collected Keys", status: "failed", reason: "Invalid email address", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), volunteer_reg_no: "2524453" },
  { id: "EML-004", recipient_name: "Anjali Verma", recipient_email: "anjali.v@example.com", subject: "Your Key Card is Ready", status: "sent", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), volunteer_reg_no: "2524454" },
  { id: "EML-005", recipient_name: "Rahul Kumar", recipient_email: "rmodi182@gmail.com", subject: "Your Roommate Has Collected Keys", status: "scheduled", timestamp: new Date(Date.now() + 1000 * 60 * 15).toISOString(), volunteer_reg_no: "2524452" }
];

const mockTriggers = [
  { event_name: "Your Roommate Has Collected Key", target_campus: "All Campuses", trigger_time: new Date(Date.now() + 1000 * 60 * 10).toISOString(), is_instant: true },
  { event_name: "Room Assignment Confirmation", target_campus: "All Campuses", trigger_time: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), is_instant: false },
  { event_name: "Welcome Orientation Reminders", target_campus: "All Campuses", trigger_time: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), is_instant: false }
];

async function seed() {
  console.log("Seeding Database...");

  // 1. Clear existing data
  await supabase.from('email_logs').delete().neq('id', '0');
  await supabase.from('email_triggers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('volunteers').delete().neq('reg_no', '0');

  // 2. Insert Volunteers
  console.log("Inserting Volunteers...");
  const { error: vError } = await supabase.from('volunteers').insert(mockVolunteers);
  if (vError) {
    console.error("Error inserting volunteers:", vError);
    process.exit(1);
  }

  // 3. Insert Emails
  console.log("Inserting Emails...");
  const { error: eError } = await supabase.from('email_logs').insert(mockEmails);
  if (eError) {
    console.error("Error inserting emails:", eError);
    process.exit(1);
  }

  // 4. Insert Triggers
  console.log("Inserting Triggers...");
  const { error: tError } = await supabase.from('email_triggers').insert(mockTriggers);
  if (tError) {
    console.error("Error inserting triggers:", tError);
    process.exit(1);
  }

  console.log("✅ Seeding completed successfully!");
}

seed();
