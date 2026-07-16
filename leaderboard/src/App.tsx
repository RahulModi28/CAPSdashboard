import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import gryffindorImg from "./assets/harry/gryffindor.png";
import slytherinImg from "./assets/harry/slytherin.png";
import ravenclawImg from "./assets/harry/ravenclaw.png";
import hufflepuffImg from "./assets/harry/hufflepuff.png";
import sortingHatImg from "./assets/harry/sorting-hat.png";

// --- CONFIGURATION ---
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxviV3javW-XwcUt80JKY8sDxv4xNTKvDijyL29yGF6n5Wl8no9VXOt-6aUfHLD7thr-Q/exec"; 

type CampusData = {
  campus: string;
  points: number;
};

const CAMPUS_MAP: Record<string, { label: string; quote: string; iconUrl: string; cssClass: string; }> = {
  BCC: { 
    label: "BCC",
    quote: '"Bold of heart, fierce of will"', 
    iconUrl: gryffindorImg,
    cssClass: "house-gryffindor"
  },
  BKC: { 
    label: "BKC", 
    quote: '"Cunning, ambitious, unyielding"',
    iconUrl: slytherinImg,
    cssClass: "house-slytherin"
  },
  BRC: { 
    label: "BRC", 
    quote: '"Wit beyond measure"',
    iconUrl: ravenclawImg,
    cssClass: "house-ravenclaw"
  },
  BYC: { 
    label: "BYC", 
    quote: '"Just and loyal"',
    iconUrl: hufflepuffImg,
    cssClass: "house-hufflepuff"
  },
};

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
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

const SortingHatLoader = () => {
  return (
    <div className="flex items-center justify-center flex-1 w-full relative">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="relative w-full h-full flex flex-col items-center justify-center gap-6"
      >
        <motion.div 
          initial={{ rotate: -10, y: 0 }}
          animate={{ rotate: 10, y: -10 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        >
          <img src={sortingHatImg} alt="Sorting Hat" className="w-32 h-32 object-contain drop-shadow-2xl" />
        </motion.div>
        <motion.div 
          className="text-[#D3A625] font-harry-title text-xl uppercase tracking-widest font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Consulting the Ledger...
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

      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2500));
      const [json] = await Promise.all([fetchPromise, minLoadingTime]);
      
      if (json) {
        const remappedData = json.map((item: any) => ({
          ...item,
          campus: item.campus === "BMC" ? "BCC" : item.campus
        }));
        setData(remappedData);
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
     return <div className="p-8 text-center text-xl text-white font-harry-body">Not enough campus data available...</div>
  }

  return (
    <div className="font-harry-body antialiased min-h-screen flex flex-col items-center hp-bg overflow-auto selection:bg-[#D3A625]/30 text-white pb-12">
      
      <main className="relative z-10 w-full h-full max-w-[1440px] px-8 sm:px-12 flex flex-col items-center justify-start py-4 sm:py-8">
        
        {/* Header */}
        <header className="text-center mb-6 sm:mb-10 w-full">
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto mb-6">
             <a href="https://rahulmodi28.github.io/CAPSdashboard/" className="text-[#D3A625] font-harry-title text-sm tracking-widest cursor-pointer hover:text-white transition-colors">
               ← Back to the landing page
             </a>
             <button onClick={() => fetchData()} className="text-[#D3A625] font-harry-title text-sm tracking-widest border border-[#D3A625] px-6 py-2 rounded hover:bg-[#D3A625]/10 transition-colors bg-transparent">
               REFRESH
             </button>
          </div>
          <span className="font-harry-title text-[#D3A625] tracking-[0.4em] uppercase text-sm mb-2 block">The Great Hall Ledger</span>
          <h1 className="font-harry-title text-4xl sm:text-5xl md:text-6xl font-bold mb-4 gold-glow-text">HOUSE POINTS SCOREBOARD</h1>
          <p className="font-harry-body italic text-white/80 text-base md:text-lg">"Points shall be awarded to the deserving, and taken from those who transgress."</p>
        </header>

        {loading ? (
          <SortingHatLoader />
        ) : (
          <div className="flex flex-col items-center w-full max-w-6xl gap-16">
            
            {/* 4 Cards Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 items-stretch justify-items-center mt-8">
              {sortedData.slice(0, 4).map((item, index) => (
                <div key={item.campus} className="flex justify-center w-full h-full">
                  <HouseCard rank={index + 1} data={item} />
                </div>
              ))}
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}

// House Card Component
function HouseCard({ 
  rank, 
  data
}: { 
  rank: number, 
  data: CampusData
}) {
  if (!data) return null;
  const info = CAMPUS_MAP[data.campus] || { label: data.campus, quote: "Unknown", iconUrl: "", cssClass: "house-ravenclaw" };

  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "🏅" };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, type: "spring", stiffness: 100, damping: 20 }}
      className={`hogwarts-card ${info.cssClass} w-full h-full max-w-[320px] p-6 lg:p-8 flex flex-col items-center text-center`}
    >
      <div className="flex flex-col items-center mb-6">
        <span className="text-4xl drop-shadow-lg mb-2">{medals[rank]}</span>
        <img src={info.iconUrl} alt={info.label} className="w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
        <h3 className="font-harry-title text-3xl font-bold tracking-wider text-white drop-shadow-md mb-2">
          {info.label}
        </h3>
        <p className="font-harry-body italic text-white/90 text-sm opacity-90 px-4">
          {info.quote}
        </p>
      </div>

      <div className="mt-auto flex flex-col items-center">
        <div className="font-harry-title text-5xl font-bold text-white tracking-wider drop-shadow-lg mb-2">
          <AnimatedNumber value={data.points} />
        </div>
        <div className="font-harry-title text-xs uppercase tracking-[0.3em] text-white/70">
          Points
        </div>
      </div>
    </motion.div>
  );
}
