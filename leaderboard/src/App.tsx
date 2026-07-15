import { useState, useEffect } from "react";
import { Building2, Trees, FlaskConical, Cpu } from "lucide-react";
import { motion } from "framer-motion";

// --- CONFIGURATION ---
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxviV3javW-XwcUt80JKY8sDxv4xNTKvDijyL29yGF6n5Wl8no9VXOt-6aUfHLD7thr-Q/exec"; 

type CampusData = {
  campus: string;
  points: number;
};

// Map campus abbreviations to their full names, icons, and colors
const CAMPUS_MAP: Record<string, { label: string; theme: string; icon: React.ReactNode; color: string; gradient: string }> = {
  BCC: { 
    label: "Central Campus",
    theme: "Downtown / Arts", 
    icon: <span className="font-display-lg text-2xl font-bold tracking-wider">BCC</span>,
    color: "#2957A4",
    gradient: "from-[#2957A4] to-[#4070C5]"
  },
  BKC: { 
    label: "Kengeri Campus", 
    theme: "Tech / Innovation",
    icon: <span className="font-display-lg text-2xl font-bold tracking-wider">BKC</span>,
    color: "#D2AE6D",
    gradient: "from-[#D2AE6D] to-[#E5C383]"
  },
  BRC: { 
    label: "Bannerghatta Campus", 
    theme: "Medical / Science",
    icon: <span className="font-display-lg text-2xl font-bold tracking-wider">BRC</span>,
    color: "#1A3A70",
    gradient: "from-[#1A3A70] to-[#2957A4]"
  },
  BYC: { 
    label: "Yeshwanthpur Campus", 
    theme: "North / Nature",
    icon: <span className="font-display-lg text-2xl font-bold tracking-wider">BYC</span>,
    color: "#B39155",
    gradient: "from-[#B39155] to-[#D2AE6D]"
  },
};

// Animated Number Component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1000;
    const startValue = displayValue;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(startValue + (value - startValue) * easeOutQuart));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <motion.span 
      key={value}
      initial={{ scale: 1.1, color: "hsl(var(--foreground))" }}
      animate={{ scale: 1, color: "currentColor" }}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

// Spark of Knowledge Loading Animation
const SparkOfKnowledgeLoader = () => {
  return (
    <div className="flex items-center justify-center flex-1 w-full relative">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-[#D2AE6D] shadow-[0_0_20px_8px_rgba(210,174,109,0.4)] z-20"
          initial={{ x: -200, y: 150, scale: 0, opacity: 0 }}
          animate={{ x: [-200, -50, 0], y: [150, -50, 0], scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 1.2, ease: "easeOut", times: [0, 0.7, 1] }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#2957A4] shadow-[0_0_10px_2px_rgba(41,87,164,0.5)]"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: Math.cos((i * 45 * Math.PI) / 180) * 100, y: Math.sin((i * 45 * Math.PI) / 180) * 100, opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ delay: 1.1, duration: 1.2, ease: "easeOut" }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-[1px] bg-gradient-to-r from-[#D2AE6D] to-[#2957A4] origin-left"
              style={{ rotate: `${i * 90 + 45}deg` }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 100, opacity: [0, 0.5, 0] }}
              transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
            />
          ))}
        </div>
        <motion.div 
          className="absolute mt-32 text-[#D2AE6D] font-mono text-sm uppercase tracking-[0.3em] font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: [10, 0, 0] }}
          transition={{ delay: 0.5, duration: 1.8 }}
        >
          Igniting Knowledge...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<CampusData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchPromise = (async () => {
        if (APPS_SCRIPT_URL.trim() === "") {
          return [
            { campus: "BCC", points: Math.floor(Math.random() * 500) + 12000 },
            { campus: "BRC", points: Math.floor(Math.random() * 500) + 18000 },
            { campus: "BKC", points: Math.floor(Math.random() * 500) + 22000 },
            { campus: "BYC", points: Math.floor(Math.random() * 500) + 15000 }
          ];
        } else {
          const response = await fetch(APPS_SCRIPT_URL);
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        }
      })();

      const minLoadingTime = new Promise(resolve => setTimeout(resolve, data.length === 0 ? 2500 : 0));
      const [json] = await Promise.all([fetchPromise, minLoadingTime]);
      
      if (json) {
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedData = [...data].sort((a, b) => b.points - a.points);
  
  if (sortedData.length < 4 && !loading) {
     return <div className="p-8 text-center text-xl text-white">Not enough campus data available...</div>
  }

  return (
    <div className="font-body-md antialiased h-screen flex flex-col items-center bg-[#010e24] overflow-hidden selection:bg-primary/30">
      
      {/* Deep Void Background */}
      <div className="fixed inset-0 z-0 bg-[#010e24]">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, rgba(41, 87, 164, 0.15) 0%, transparent 70%)" }}></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}></div>
      </div>

      <main className="relative z-10 w-full h-full max-w-[1440px] px-container-padding-desktop flex flex-col items-center justify-center py-4 sm:py-8">
        
        {/* Minimal Header */}
        <header className="text-center mb-6 sm:mb-10">
          <h1 className="font-display-lg text-display-lg text-white mb-2">Scoreboard of Leadership Team Camp</h1>
        </header>

        {loading && data.length === 0 ? (
          <SparkOfKnowledgeLoader />
        ) : (
          <>
            {/* Holographic Podium */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-end mb-8 sm:mb-12">
              
              {/* Rank 2 (Left) */}
              <PodiumColumn 
                rank={2} 
                data={sortedData[1]} 
                heightClass="h-56" 
                beamClass="blue-beam"
                delay={0.2}
              />
              
              {/* Rank 1 (Center) */}
              <PodiumColumn 
                rank={1} 
                data={sortedData[0]} 
                heightClass="h-80" 
                beamClass="gold-beam"
                glowTopClass="gold-glow-top"
                delay={0.1}
                isCenter={true}
              />
              
              {/* Rank 3 (Right) */}
              <PodiumColumn 
                rank={3} 
                data={sortedData[2]} 
                heightClass="h-44" 
                beamClass="blue-beam"
                delay={0.3}
                animationDelay="2.5s"
              />
            </div>

            {/* Challenger Section (Rank 4) */}
            <ChallengerCard rank={4} data={sortedData[3]} />
          </>
        )}

      </main>


    </div>
  );
}

// Podium Column Component
function PodiumColumn({ 
  rank, 
  data, 
  heightClass, 
  beamClass, 
  glowTopClass = "",
  delay,
  animationDelay = "1s",
  isCenter = false
}: { 
  rank: number, 
  data: CampusData, 
  heightClass: string, 
  beamClass: string,
  glowTopClass?: string,
  delay: number,
  animationDelay?: string,
  isCenter?: boolean
}) {
  if (!data) return null;
  const info = CAMPUS_MAP[data.campus] || { label: data.campus, theme: "Unknown", icon: <Building2 className="w-10 h-10" />, color: "hsl(var(--primary))", gradient: "from-primary to-primary/50" };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 20 }}
      className={`flex flex-col items-center ${isCenter ? 'order-first md:order-none' : ''}`}
    >
      <div className={`mb-${isCenter ? '10' : '8'} flex flex-col items-center text-center`}>
        <div className={`w-${isCenter ? '28 h-28' : '20 h-20'} rounded-full border border-primary/20 p-2 sm:p-4 mb-${isCenter ? '6' : '4'} relative bg-white/5 flex items-center justify-center text-white backdrop-blur-md`}>
          {info.icon}
          {isCenter && (
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-2xl border border-white/20">
              <span className="material-symbols-outlined text-on-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
          )}
        </div>
        <h3 className={`${isCenter ? 'font-headline-lg text-headline-lg text-white' : 'font-headline-md text-headline-md text-white/90'}`}>
          {info.label.replace(" Campus", "")}
        </h3>
      </div>

      <div className={`holographic-pillar ${beamClass} w-full ${heightClass} rounded-t-${isCenter ? '2xl' : 'xl'} flex flex-col items-center pt-${isCenter ? '12' : '8'}`}>
        <div className={`pillar-glow-top ${glowTopClass}`}></div>
        <div className="light-stream" style={{ animationDelay }}></div>
        <span className={`font-display-lg ${isCenter ? 'text-display-lg text-secondary/30 mb-4' : 'text-headline-lg text-white/20 mb-2'}`}>
          {rank}{rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}
        </span>
        <div className={`text-white ${isCenter ? 'font-display-lg text-display-lg drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'font-headline-lg text-headline-lg tracking-tight'}`}>
          <AnimatedNumber value={data.points} />
        </div>
        <div className={`${isCenter ? 'text-secondary/60 font-label-md text-label-md mt-2' : 'text-white/40 font-label-sm text-label-sm mt-1'} uppercase ${isCenter ? 'tracking-widest' : 'tracking-tighter'}`}>
          {isCenter ? 'Points' : 'Pts'}
        </div>
      </div>
    </motion.div>
  );
}

// Challenger Card Component
function ChallengerCard({ rank, data }: { rank: number, data: CampusData }) {
  if (!data) return null;
  const info = CAMPUS_MAP[data.campus] || { label: data.campus, theme: "Unknown", icon: <Building2 className="w-6 h-6" />, color: "hsl(var(--primary))", gradient: "from-primary to-primary/50" };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 24 }}
      className="w-full max-w-4xl"
    >
      <div className="challenger-pulse bg-white/[0.03] border border-white/10 rounded-full px-8 py-4 sm:px-12 sm:py-6 flex flex-col sm:flex-row items-center justify-between group hover:border-primary/40 transition-all duration-500 backdrop-blur-sm gap-4 sm:gap-0">
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-primary/50 uppercase">Rank</span>
            <span className="font-display-lg text-headline-md text-white">0{rank}</span>
          </div>
          <div className="h-12 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white bg-white/5">
              {info.icon}
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-white/90">{info.label}</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">Challenger Class</p>
            </div>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <div className="font-display-lg text-headline-lg text-white tracking-tighter">
            <AnimatedNumber value={data.points} />
          </div>
          <p className="font-label-sm text-label-sm text-primary/40 uppercase tracking-[0.2em] text-[10px]">Current Rating</p>
        </div>
      </div>
    </motion.div>
  );
}
