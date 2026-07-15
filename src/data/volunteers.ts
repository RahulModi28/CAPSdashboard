export interface Volunteer {
  reg: string;
  name: string;
  campus: string;
  hostel: string;
  room: string;
  partner: string;
  phone: string;
  email: string;
  keysCollected: boolean;
}

export const volunteers: Volunteer[] = [
  // Boys
  { reg: "2524443", name: "Aarav Sharma",    campus: "Bangalore Central Campus",    hostel: "CHRIST Hall Boys",    room: "A-101", partner: "Rohan Desai",    phone: "+91 98765 43210", email: "aarav.sharma@christuniversity.in",    keysCollected: true },
  { reg: "2524444", name: "Rohan Desai",     campus: "Bangalore Central Campus",    hostel: "CHRIST Hall Boys",    room: "A-101", partner: "Aarav Sharma",   phone: "+91 98765 43211", email: "rohan.desai@christuniversity.in",     keysCollected: true },
  { reg: "2524445", name: "Karan Patel",     campus: "Bangalore BGR Campus",        hostel: "CHRIST Hall Boys",    room: "B-204", partner: "Mihir Nair",     phone: "+91 98765 43212", email: "karan.patel@christuniversity.in",     keysCollected: false },
  { reg: "2524446", name: "Mihir Nair",      campus: "Bangalore BGR Campus",        hostel: "CHRIST Hall Boys",    room: "B-204", partner: "Karan Patel",    phone: "+91 98765 43213", email: "mihir.nair@christuniversity.in",      keysCollected: false },
  { reg: "2524447", name: "Ishaan Malhotra", campus: "Bangalore Kengeri Campus",    hostel: "CHRIST Hall Boys",    room: "C-312", partner: "Aditya Bose",    phone: "+91 98765 43214", email: "ishaan.malhotra@christuniversity.in", keysCollected: true },
  { reg: "2524448", name: "Aditya Bose",     campus: "Bangalore Kengeri Campus",    hostel: "CHRIST Hall Boys",    room: "C-312", partner: "Ishaan Malhotra",phone: "+91 98765 43215", email: "aditya.bose@christuniversity.in",     keysCollected: true },
  { reg: "2524449", name: "Varun Tiwari",    campus: "Bangalore Yeshwanthpur",      hostel: "CHRIST Hall Boys",    room: "D-108", partner: "Siddharth Roy",  phone: "+91 98765 43216", email: "varun.tiwari@christuniversity.in",    keysCollected: false },
  { reg: "2524450", name: "Siddharth Roy",   campus: "Bangalore Yeshwanthpur",      hostel: "CHRIST Hall Boys",    room: "D-108", partner: "Varun Tiwari",   phone: "+91 98765 43217", email: "siddharth.roy@christuniversity.in",   keysCollected: false },

  // Girls
  { reg: "2524453", name: "Sneha Kulkarni",  campus: "Bangalore Central Campus",    hostel: "CHRIST Hall Girls",   room: "A-203", partner: "Anjali Verma",   phone: "+91 98765 43218", email: "sneha.kulkarni@christuniversity.in",  keysCollected: false },
  { reg: "2524454", name: "Anjali Verma",    campus: "Bangalore Central Campus",    hostel: "CHRIST Hall Girls",   room: "A-203", partner: "Sneha Kulkarni", phone: "+91 98765 43219", email: "anjali.verma@christuniversity.in",    keysCollected: true },
  { reg: "2524457", name: "Nisha Gupta",     campus: "Bangalore BGR Campus",        hostel: "CHRIST Hall Girls",   room: "B-307", partner: "Riya Singh",     phone: "+91 98765 43220", email: "nisha.gupta@christuniversity.in",     keysCollected: true },
  { reg: "2524458", name: "Riya Singh",      campus: "Bangalore BGR Campus",        hostel: "CHRIST Hall Girls",   room: "B-307", partner: "Nisha Gupta",    phone: "+91 98765 43221", email: "riya.singh@christuniversity.in",      keysCollected: true },
  { reg: "2524459", name: "Meera Iyer",      campus: "Bangalore Kengeri Campus",    hostel: "CHRIST Hall Girls",   room: "C-405", partner: "Pooja Reddy",    phone: "+91 98765 43222", email: "meera.iyer@christuniversity.in",      keysCollected: false },
  { reg: "2524460", name: "Pooja Reddy",     campus: "Bangalore Kengeri Campus",    hostel: "CHRIST Hall Girls",   room: "C-405", partner: "Meera Iyer",     phone: "+91 98765 43223", email: "pooja.reddy@christuniversity.in",     keysCollected: false },
];
