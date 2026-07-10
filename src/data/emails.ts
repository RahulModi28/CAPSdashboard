export type EmailStatus = "sent" | "pending" | "scheduled" | "failed";

export interface EmailEvent {
  id: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  status: EmailStatus;
  timestamp: string; // ISO date string
  reason?: string; // If failed
}

export const initialEmails: EmailEvent[] = [
  {
    id: "EML-001",
    recipientName: "Priya Mehta",
    recipientEmail: "priya.mehta@example.com",
    subject: "Your Key Card is Ready",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "EML-002",
    recipientName: "Rohan Desai",
    recipientEmail: "rohan.desai@example.com",
    subject: "Action Required: Registration Pending",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "EML-003",
    recipientName: "Sneha Kulkarni",
    recipientEmail: "sneha.k@example.com",
    subject: "Your Roommate Has Collected Keys",
    status: "failed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reason: "Invalid email address",
  },
  {
    id: "EML-004",
    recipientName: "Anjali Verma",
    recipientEmail: "anjali.v@example.com",
    subject: "Your Key Card is Ready",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "EML-005",
    recipientName: "Mihir Nair",
    recipientEmail: "mihir.nair@example.com",
    subject: "Your Roommate Has Collected Keys",
    status: "scheduled",
    timestamp: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  }
];
