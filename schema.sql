-- Create the 'volunteers' table
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reg_no VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    email VARCHAR,
    campus VARCHAR,
    room VARCHAR,
    partner_name VARCHAR,
    keys_collected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the 'email_logs' table
CREATE TABLE email_logs (
    id VARCHAR PRIMARY KEY,
    recipient_name VARCHAR NOT NULL,
    recipient_email VARCHAR NOT NULL,
    subject VARCHAR NOT NULL,
    status VARCHAR CHECK (status IN ('sent', 'pending', 'scheduled', 'failed')) NOT NULL,
    reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    volunteer_reg_no VARCHAR REFERENCES volunteers(reg_no) ON DELETE SET NULL
);

-- Create the 'email_triggers' table
CREATE TABLE email_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR NOT NULL,
    target_campus VARCHAR DEFAULT 'All Campuses',
    trigger_time TIMESTAMPTZ NOT NULL,
    is_instant BOOLEAN DEFAULT false
);
