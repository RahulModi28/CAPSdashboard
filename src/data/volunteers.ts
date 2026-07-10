export interface Volunteer {
  reg: string;
  name: string;
  campus: string;
  room: string;
  partner: string;
  keysCollected: boolean;
}

export const volunteers: Volunteer[] = [
  { reg: "2524443", name: "Aarav Sharma",    campus: "Bangalore Central Campus",    room: "A-101", partner: "Priya Mehta",    keysCollected: true },
  { reg: "2524444", name: "Priya Mehta",     campus: "Bangalore Central Campus",    room: "A-101", partner: "Aarav Sharma",   keysCollected: true },
  { reg: "2524445", name: "Rohan Desai",     campus: "Bangalore BGR Campus",        room: "B-204", partner: "Sneha Kulkarni", keysCollected: false },
  { reg: "2524446", name: "Sneha Kulkarni",  campus: "Bangalore BGR Campus",        room: "B-204", partner: "Rohan Desai",    keysCollected: false },
  { reg: "2524447", name: "Karan Patel",     campus: "Bangalore Kengeri Campus",    room: "C-312", partner: "Anjali Verma",   keysCollected: true },
  { reg: "2524448", name: "Anjali Verma",    campus: "Bangalore Kengeri Campus",    room: "C-312", partner: "Karan Patel",    keysCollected: true },
  { reg: "2524449", name: "Tanvi Joshi",     campus: "Bangalore Yeshwanthpur",      room: "D-108", partner: "Mihir Nair",     keysCollected: false },
  { reg: "2524450", name: "Mihir Nair",      campus: "Bangalore Yeshwanthpur",      room: "D-108", partner: "Tanvi Joshi",    keysCollected: false },
  { reg: "2524451", name: "Ishaan Malhotra", campus: "Delhi NCR Campus",            room: "E-215", partner: "Divya Rao",      keysCollected: true },
  { reg: "2524452", name: "Divya Rao",       campus: "Delhi NCR Campus",            room: "E-215", partner: "Ishaan Malhotra",keysCollected: true },
  { reg: "2524453", name: "Aditya Bose",     campus: "Bangalore Central Campus",    room: "A-203", partner: "Nisha Gupta",    keysCollected: false },
  { reg: "2524454", name: "Nisha Gupta",     campus: "Bangalore Central Campus",    room: "A-203", partner: "Aditya Bose",    keysCollected: true },
  { reg: "2524455", name: "Riya Singh",      campus: "Pune Lavasa Campus",          room: "F-110", partner: "Varun Tiwari",   keysCollected: false },
  { reg: "2524456", name: "Varun Tiwari",    campus: "Pune Lavasa Campus",          room: "F-110", partner: "Riya Singh",     keysCollected: false },
  { reg: "2524457", name: "Meera Iyer",      campus: "Bangalore BGR Campus",        room: "B-307", partner: "Siddharth Roy",  keysCollected: true },
  { reg: "2524458", name: "Siddharth Roy",   campus: "Bangalore BGR Campus",        room: "B-307", partner: "Meera Iyer",     keysCollected: true },
  { reg: "2524459", name: "Pooja Reddy",     campus: "Bangalore Kengeri Campus",    room: "C-405", partner: "Arjun Kapoor",   keysCollected: false },
  { reg: "2524460", name: "Arjun Kapoor",    campus: "Bangalore Kengeri Campus",    room: "C-405", partner: "Pooja Reddy",    keysCollected: false },
];
