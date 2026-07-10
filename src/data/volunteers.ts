export interface Volunteer {
  reg: string;
  name: string;
  campus: string;
  room: string;
  partner: string;
  keysCollected: boolean;
}

export const volunteers: Volunteer[] = [
  // Boys
  { reg: "2524443", name: "Aarav Sharma",    campus: "Bangalore Central Campus",    room: "A-101", partner: "Rohan Desai",    keysCollected: true },
  { reg: "2524444", name: "Rohan Desai",     campus: "Bangalore Central Campus",    room: "A-101", partner: "Aarav Sharma",   keysCollected: true },
  { reg: "2524445", name: "Karan Patel",     campus: "Bangalore BGR Campus",        room: "B-204", partner: "Mihir Nair",     keysCollected: false },
  { reg: "2524446", name: "Mihir Nair",      campus: "Bangalore BGR Campus",        room: "B-204", partner: "Karan Patel",    keysCollected: false },
  { reg: "2524447", name: "Ishaan Malhotra", campus: "Bangalore Kengeri Campus",    room: "C-312", partner: "Aditya Bose",    keysCollected: true },
  { reg: "2524448", name: "Aditya Bose",     campus: "Bangalore Kengeri Campus",    room: "C-312", partner: "Ishaan Malhotra",keysCollected: true },
  { reg: "2524449", name: "Varun Tiwari",    campus: "Bangalore Yeshwanthpur",      room: "D-108", partner: "Siddharth Roy",  keysCollected: false },
  { reg: "2524450", name: "Siddharth Roy",   campus: "Bangalore Yeshwanthpur",      room: "D-108", partner: "Varun Tiwari",   keysCollected: false },
  { reg: "2524451", name: "Arjun Kapoor",    campus: "Delhi NCR Campus",            room: "E-215", partner: "Rahul Kumar",    keysCollected: true },
  { reg: "2524452", name: "Rahul Kumar",     campus: "Delhi NCR Campus",            room: "E-215", partner: "Arjun Kapoor",   keysCollected: true },

  // Girls
  { reg: "2524453", name: "Sneha Kulkarni",  campus: "Bangalore Central Campus",    room: "A-203", partner: "Anjali Verma",   keysCollected: false },
  { reg: "2524454", name: "Anjali Verma",    campus: "Bangalore Central Campus",    room: "A-203", partner: "Sneha Kulkarni", keysCollected: true },
  { reg: "2524455", name: "Tanvi Joshi",     campus: "Pune Lavasa Campus",          room: "F-110", partner: "Divya Rao",      keysCollected: false },
  { reg: "2524456", name: "Divya Rao",       campus: "Pune Lavasa Campus",          room: "F-110", partner: "Tanvi Joshi",    keysCollected: false },
  { reg: "2524457", name: "Nisha Gupta",     campus: "Bangalore BGR Campus",        room: "B-307", partner: "Riya Singh",     keysCollected: true },
  { reg: "2524458", name: "Riya Singh",      campus: "Bangalore BGR Campus",        room: "B-307", partner: "Nisha Gupta",    keysCollected: true },
  { reg: "2524459", name: "Meera Iyer",      campus: "Bangalore Kengeri Campus",    room: "C-405", partner: "Pooja Reddy",    keysCollected: false },
  { reg: "2524460", name: "Pooja Reddy",     campus: "Bangalore Kengeri Campus",    room: "C-405", partner: "Meera Iyer",     keysCollected: false },
];
