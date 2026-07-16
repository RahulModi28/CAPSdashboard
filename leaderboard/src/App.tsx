import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Lock, Eye, CheckCircle2 } from "lucide-react";
import { supabase } from "./supabaseClient";

import gryffindorImg from "./assets/harry/gryffindor.png";
import slytherinImg from "./assets/harry/slytherin.png";
import ravenclawImg from "./assets/harry/ravenclaw.png";
import hufflepuffImg from "./assets/harry/hufflepuff.png";
import sortingHatImg from "./assets/harry/sorting-hat.png";
import hedwigsTheme from "./assets/harry/hedwigs-theme.mp4";

const ADMIN_PASSWORD = "lumos";

type AppState = "LOCKED" | "ADMIN" | "REVEAL" | "LEADERBOARD";
type CampusData = { campus: string; points: number };
type HouseAssignment = Record<string, string>;

const DEFAULT_ASSIGNMENTS: HouseAssignment = {
  BCC: "Gryffindor",
  BKC: "Slytherin",
  BRC: "Ravenclaw",
  BYC: "Hufflepuff"
};

const HOUSES: Record<string, { quote: string; iconUrl: string; cssClass: string }> = {
  Gryffindor: { quote: '"Bold of heart, fierce of will"', iconUrl: gryffindorImg, cssClass: "house-gryffindor" },
  Slytherin: { quote: '"Cunning, ambitious, unyielding"', iconUrl: slytherinImg, cssClass: "house-slytherin" },
  Ravenclaw: { quote: '"Wit beyond measure"', iconUrl: ravenclawImg, cssClass: "house-ravenclaw" },
  Hufflepuff: { quote: '"Just and loyal"', iconUrl: hufflepuffImg, cssClass: "house-hufflepuff" }
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("LOCKED");
  const [data, setData] = useState<CampusData[]>([]);
  const [assignments, setAssignments] = useState<HouseAssignment>(DEFAULT_ASSIGNMENTS);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const fetchData = async () => {
    try {
      const { data: lbData, error: lbError } = await supabase.from("leaderboard").select("*");
      const { data: stateData, error: stateError } = await supabase.from("ceremony_state").select("*").eq("id", 1).single();

      if (lbError) throw lbError;
      if (stateError) throw stateError;

      const newScores = (lbData || [])
        .filter((row: any) => row.campus && String(row.campus).trim() !== "")
        .sort((a, b) => b.points - a.points);
      
      const isUnlocked = stateData.is_unlocked === true;
      const newAssignments = stateData.assignments || DEFAULT_ASSIGNMENTS;

      setData(newScores);
      setAssignments(newAssignments);

      // Transition states based on server lock status
      setAppState((current) => {
        if (current === "LOCKED" && isUnlocked) {
          setTimeout(() => setAppState("LEADERBOARD"), 8000); 
          return "REVEAL";
        }
        if (current === "REVEAL") return current; 
        if (current === "ADMIN") return current; 
        return isUnlocked ? "LEADERBOARD" : "LOCKED";
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // initial fetch

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="font-harry-body antialiased min-h-screen flex flex-col items-center hp-bg overflow-auto selection:bg-[#D3A625]/30 text-white pb-12">
      <audio ref={audioRef} src={hedwigsTheme} loop />
      
      {/* Floating Music Button */}
      <button 
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black/70 border border-[#D3A625]/50 flex items-center justify-center hover:bg-[#D3A625]/30 hover:scale-110 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(211,166,37,0.3)] text-[#D3A625]"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
      </button>

      <main className="relative z-10 w-full h-full max-w-[1440px] px-8 sm:px-12 flex flex-col items-center justify-center py-4 sm:py-8 min-h-screen">
        <AnimatePresence mode="wait">
          {appState === "LOCKED" && <LockScreen key="lock" onAdminAccess={() => setAppState("ADMIN")} />}
          {appState === "ADMIN" && (
            <AdminPanel 
              key="admin" 
              currentAssignments={assignments} 
              data={data} 
              onBroadcast={() => setTimeout(fetchData, 1000)} 
            />
          )}
          {appState === "REVEAL" && <RevealScreen key="reveal" assignments={assignments} />}
          {appState === "LEADERBOARD" && (
             <LeaderboardScreen 
               key="leaderboard" 
               data={data} 
               assignments={assignments} 
               loading={loading}
             />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SCREENS ---

function LockScreen({ onAdminAccess }: { onAdminAccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === ADMIN_PASSWORD) {
      onAdminAccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword("");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center bg-black/60 p-12 rounded-2xl backdrop-blur-md border border-[#D3A625]/30 shadow-2xl"
    >
      <Lock className="w-16 h-16 text-[#D3A625] mb-6 drop-shadow-[0_0_15px_rgba(211,166,37,0.5)]" />
      <h1 className="font-harry-title text-5xl mb-2 gold-glow-text">The Great Hall is Sealed</h1>
      <p className="font-harry-body text-xl text-white/70 italic mb-8">"Only those who speak the password may enter."</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm">
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password..."
          className={`w-full bg-transparent border-b-2 ${error ? 'border-red-500 text-red-400' : 'border-[#D3A625] text-white'} text-center text-2xl py-2 mb-8 focus:outline-none focus:border-white transition-colors`}
        />
        <button type="submit" className="text-[#D3A625] font-harry-title text-xl tracking-widest border border-[#D3A625] px-8 py-3 rounded hover:bg-[#D3A625]/20 transition-all">
          Unlock
        </button>
      </form>
    </motion.div>
  );
}

function PointControl({ item }: { item: any }) {
  const [change, setChange] = useState<number | string>(10);
  
  const updatePoints = async (campus: string, newPoints: number) => {
    try {
      await supabase.from('leaderboard').update({ points: newPoints }).eq('campus', campus);
    } catch (error) {
      console.error("Failed to update points:", error);
    }
  };

  return (
    <div className="flex items-center gap-3 w-full justify-between mt-2">
      <span className="text-2xl font-bold text-[#D3A625] w-16 text-center">{item.points} <span className="text-xs text-white/50 block font-normal tracking-widest uppercase">PTS</span></span>
      <div className="flex items-center gap-2">
        <button onClick={() => updatePoints(item.campus, item.points - (Number(change) || 0))} className="text-xl font-bold bg-red-900/50 hover:bg-red-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md">-</button>
        <input 
          type="number" 
          value={change} 
          onChange={(e) => setChange(e.target.value === '' ? '' : Number(e.target.value))} 
          className="w-16 bg-black border border-[#D3A625] text-white text-center rounded p-2 focus:outline-none" 
        />
        <button onClick={() => updatePoints(item.campus, item.points + (Number(change) || 0))} className="text-xl font-bold bg-green-900/50 hover:bg-green-800 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md">+</button>
      </div>
    </div>
  );
}

function AdminPanel({ currentAssignments, data, onBroadcast }: { currentAssignments: HouseAssignment, data: any[], onBroadcast: () => void }) {
  const [assignments, setAssignments] = useState<HouseAssignment>(currentAssignments);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const houses = ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"];

  const handleBroadcast = async () => {
    setStatus("sending");
    try {
      const { error } = await supabase
        .from('ceremony_state')
        .update({ is_unlocked: true, assignments: assignments })
        .eq('id', 1);

      if (error) throw error;
      
      setStatus("done");
      onBroadcast();
    } catch (error) {
      console.error(error);
      setStatus("idle");
      alert("Failed to broadcast.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full max-w-4xl bg-black/80 p-8 rounded-xl border border-[#D3A625]/50 shadow-2xl">
      <h1 className="font-harry-title text-5xl mb-2 gold-glow-text text-center">Admin: Sorting Ceremony</h1>
      <p className="text-white/70 italic mb-8 text-center max-w-2xl">Update points and assign the houses below. When ready, click Broadcast to unlock the screens of everyone in the audience!</p>
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {data.map(item => (
          <div key={item.campus} className="flex flex-col items-center bg-white/5 p-4 rounded-lg border border-white/10 shadow-inner">
            <span className="font-harry-title text-4xl text-white mb-2 tracking-widest">{item.campus}</span>
            <PointControl item={item} />
            <select 
              className="bg-black border border-[#D3A625] text-[#D3A625] text-xl p-2 rounded focus:outline-none w-full text-center mt-4 tracking-widest font-bold uppercase"
              value={assignments[item.campus] || "Ravenclaw"}
              onChange={(e) => setAssignments({ ...assignments, [item.campus]: e.target.value })}
            >
              {houses.map(house => (
                <option key={house} value={house}>{house}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button 
        onClick={handleBroadcast}
        disabled={status !== "idle"}
        className="flex items-center gap-3 bg-[#D3A625] text-black font-harry-title text-2xl px-10 py-4 rounded hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(211,166,37,0.5)]"
      >
        {status === "idle" && <><Eye size={28} /> Broadcast to Great Hall</>}
        {status === "sending" && "Broadcasting..."}
        {status === "done" && <><CheckCircle2 size={28} /> Unlocked Everywhere!</>}
      </button>
    </motion.div>
  );
}

function RevealScreen({ assignments }: { assignments: HouseAssignment }) {
  const entries = Object.entries(assignments); 
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full min-h-[60vh]">
      <h1 className="font-harry-title text-5xl sm:text-7xl mb-16 gold-glow-text text-center animate-pulse">The Sorting Ceremony Begins...</h1>
      <div className="flex flex-wrap justify-center gap-12 md:gap-24 w-full max-w-6xl">
        {entries.map(([campus, houseName], index) => {
          const house = HOUSES[houseName] || HOUSES["Ravenclaw"];
          return (
            <motion.div 
              key={campus}
              initial={{ opacity: 0, y: 100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 1.5, duration: 1, type: "spring" }}
              className="flex flex-col items-center"
            >
              <img src={house.iconUrl} className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_30px_rgba(211,166,37,0.4)] mb-6" alt={houseName} />
              <div className="font-harry-title text-5xl text-white drop-shadow-md">{campus}</div>
              <div className="text-[#D3A625] font-bold tracking-widest uppercase mt-2">{houseName}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LeaderboardScreen({ data, assignments, loading }: any) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
      <header className="text-center mb-6 sm:mb-10 w-full relative">
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto mb-6">
           <a href="https://caps-landing-page.vercel.app" className="text-[#D3A625] font-harry-title text-sm tracking-widest cursor-pointer hover:text-white transition-colors z-20">
             ← Back to the landing page
           </a>
           <div className="flex gap-4 z-20">
             {!isAdmin && (
               <button onClick={() => setShowAdminLogin(!showAdminLogin)} className="hover:scale-110 transition-transform focus:outline-none">
                 <img src={sortingHatImg} alt="Admin Access" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(211,166,37,0.6)]" />
               </button>
             )}
             {isAdmin && (
               <button onClick={() => setIsAdmin(false)} className="text-red-400 font-harry-title text-sm tracking-widest border border-red-500/50 px-4 py-2 rounded hover:bg-red-500/20 transition-colors bg-black/50 backdrop-blur-sm">
                 LOG OUT
               </button>
             )}
           </div>
        </div>

        {/* Mini Admin Login Popup */}
        <AnimatePresence>
          {showAdminLogin && !isAdmin && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 right-0 bg-black/90 p-6 rounded-lg border border-[#D3A625]/50 z-50 shadow-2xl backdrop-blur-md"
            >
              <form onSubmit={handleLogin} className="flex flex-col items-center">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password..."
                  className={`w-full bg-transparent border-b-2 ${error ? 'border-red-500 text-red-400' : 'border-[#D3A625] text-white'} text-center text-xl py-2 mb-4 focus:outline-none focus:border-white transition-colors`}
                />
                <button type="submit" className="text-[#D3A625] font-harry-title tracking-widest border border-[#D3A625] px-6 py-2 rounded hover:bg-[#D3A625]/20 transition-all">
                  Login
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Admin Points Editor */}
        <AnimatePresence>
          {isAdmin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-5xl mx-auto mb-8 bg-black/80 p-6 rounded-xl border border-[#D3A625]/40 flex flex-wrap justify-center gap-6 backdrop-blur-md overflow-hidden"
            >
              {data.map((item: any) => (
                <div key={item.campus} className="flex flex-col items-center gap-2 bg-white/5 p-4 rounded-lg border border-white/10 w-full sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)]">
                  <span className="font-harry-title text-3xl text-white tracking-widest">{item.campus}</span>
                  <PointControl item={item} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <span className="font-harry-title text-[#D3A625] tracking-[0.4em] uppercase text-sm mb-2 block relative z-10">The Great Hall Ledger</span>
        <h1 className="font-harry-title text-4xl sm:text-5xl md:text-6xl font-bold mb-4 gold-glow-text relative z-10">HOUSE POINTS SCOREBOARD</h1>
        <p className="font-harry-body italic text-white/80 text-base md:text-lg relative z-10">"Points shall be awarded to the deserving, and taken from those who transgress."</p>
      </header>

      {loading && data.length === 0 ? (
        <SortingHatLoader />
      ) : (
        <div className="flex flex-col items-center w-full max-w-6xl gap-16">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 items-stretch justify-items-center mt-8">
            {data.slice(0, 4).map((item: any, index: number) => (
              <motion.div layout key={item.campus} className="flex justify-center w-full h-full" transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                <HouseCard rank={index + 1} data={item} houseName={assignments[item.campus]} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function HouseCard({ rank, data, houseName }: any) {
  if (!data) return null;
  const info = HOUSES[houseName] || HOUSES["Ravenclaw"];
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: "spring", stiffness: 100, damping: 20 }}
      className={`hogwarts-card ${info.cssClass} w-full h-full max-w-[320px] p-6 lg:p-8 flex flex-col items-center text-center`}
    >
      <div className="flex flex-col items-center mb-6">
        <span className="text-4xl drop-shadow-lg mb-2">{medals[rank]}</span>
        <img src={info.iconUrl} alt={houseName} className="w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
        <h3 className="font-harry-title text-3xl font-bold tracking-wider text-white drop-shadow-md mb-2">
          {data.campus}
        </h3>
        <p className="font-harry-body italic text-white/90 text-sm opacity-90 px-4">
          {info.quote}
        </p>
      </div>
      <div className="mt-auto flex flex-col items-center">
        <div className="font-harry-title text-5xl font-bold text-white tracking-wider drop-shadow-lg mb-2">
          <AnimatedNumber value={data.points} />
        </div>
        <div className="text-white/60 tracking-[0.2em] uppercase text-xs">Points</div>
      </div>
    </motion.div>
  );
}

const SortingHatLoader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <motion.img 
      src={sortingHatImg} alt="Sorting Hat" className="w-48 h-48 drop-shadow-2xl object-contain"
      animate={{ rotate: [-5, 5, -5], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    />
    <motion.p 
      className="mt-8 font-harry-title text-2xl text-[#D3A625] tracking-widest drop-shadow-md"
      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
    >
      Hmm... difficult. Very difficult...
    </motion.p>
  </div>
);

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}
