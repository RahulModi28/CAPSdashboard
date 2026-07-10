import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  Search, Users, Building2, DoorOpen, X, 
  LayoutDashboard, Settings, 
  Plus, ChevronRight, CheckCircle2, MoreVertical,
  Key, KeyRound, Mail, Clock, AlertCircle, Send
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

import { volunteers as initialVolunteers, type Volunteer } from "@/data/volunteers";
import { initialEmails, type EmailEvent } from "@/data/emails";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ══════════════════════════════════════
   MAIN DASHBOARD APP
══════════════════════════════════════ */
export default function App() {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [query, setQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [result, setResult] = useState<Volunteer | "not-found" | "idle" | "loading">("idle");
  const [currentView, setCurrentView] = useState<"dashboard" | "directory" | "emails">("dashboard");
  const [emailsList, setEmailsList] = useState<EmailEvent[]>(initialEmails);

  const emailPieData = useMemo(() => {
    const sent = emailsList.filter(e => e.status === "sent").length;
    const pending = emailsList.filter(e => e.status === "pending" || e.status === "scheduled").length;
    const failed = emailsList.filter(e => e.status === "failed").length;
    
    return [
      { name: 'Sent', value: sent, color: '#10b981' }, 
      { name: 'Pending & Scheduled', value: pending, color: '#f59e0b' },
      { name: 'Failed', value: failed, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [emailsList]);

  const emailStats = useMemo(() => ({
    total: emailsList.length,
    sent: emailsList.filter(e => e.status === "sent").length,
    pending: emailsList.filter(e => e.status === "pending").length,
    scheduled: emailsList.filter(e => e.status === "scheduled").length,
    failed: emailsList.filter(e => e.status === "failed").length,
  }), [emailsList]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({length: 12}, (_, i) => {
      const h = (new Date().getHours() - 11 + i + 24) % 24;
      const label = `${h.toString().padStart(2,'0')}:00`;
      const count = emailsList.filter(e => new Date(e.timestamp).getHours() === h).length;
      return { hour: label, emails: count };
    });
    return hours;
  }, [emailsList]);

  const campusDelivery = useMemo(() => {
    const campusMap: Record<string, { sent: number; total: number }> = {};
    volunteers.forEach(v => {
      if (!campusMap[v.campus]) campusMap[v.campus] = { sent: 0, total: 0 };
      const emails = emailsList.filter(e => e.recipientName === v.name);
      campusMap[v.campus].total += emails.length;
      campusMap[v.campus].sent += emails.filter(e => e.status === "sent").length;
    });
    return Object.entries(campusMap).map(([campus, d]) => ({
      campus,
      label: campus.split(' ').slice(-2, -1)[0] || campus.split(' ')[0],
      rate: d.total > 0 ? Math.round((d.sent / d.total) * 100) : 0,
      sent: d.sent,
      total: d.total,
    }));
  }, [emailsList, volunteers]);

  const [broadcastCampus, setBroadcastCampus] = useState<string>("All Campuses");
  const [broadcastTrigger, setBroadcastTrigger] = useState<string>("Key Collection Reminder");

  const stats = useMemo(() => {
    const campusCounts = volunteers.reduce((acc, v) => {
      acc[v.campus] = (acc[v.campus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keysCollected = volunteers.filter(v => v.keysCollected).length;

    return {
      total: volunteers.length,
      campuses: Object.keys(campusCounts).length,
      campusCounts,
      rooms: new Set(volunteers.map((v) => v.room)).size,
      pairs: Math.floor(volunteers.length / 2),
      keysCollected,
      keysPending: volunteers.length - keysCollected
    };
  }, [volunteers]);

  const filtered = useMemo(() => {
    const q = tableFilter.toLowerCase();
    if (!q) return volunteers;
    return volunteers.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.campus.toLowerCase().includes(q) ||
        v.room.toLowerCase().includes(q) ||
        v.reg.toLowerCase().includes(q) ||
        v.partner.toLowerCase().includes(q)
    );
  }, [tableFilter, volunteers]);

  function doSearch(reg?: string) {
    const searchQuery = (reg ?? query).trim().toUpperCase();
    if (!searchQuery) return;
    setResult("loading");
    setTimeout(() => {
      const found = volunteers.find((v) => v.reg.toUpperCase() === searchQuery);
      if (found) {
        setResult(found);
      } else {
        setResult("not-found");
        toast.error("Record not found");
      }
    }, 400);
  }

  function quickFill(reg: string) {
    setQuery(reg);
    doSearch(reg);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground selection:bg-primary/20 selection:text-primary">
      <Toaster position="top-right" theme="light" />

      {/* ── THIN LEFT SIDEBAR ── */}
      <aside className="w-16 flex-shrink-0 glass-panel border-r border-white/10 flex flex-col items-center py-6 justify-between z-20">
        <div className="flex flex-col items-center gap-8">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center premium-shadow mb-4">
            <Users className="w-5 h-5" />
          </div>
          <nav className="flex flex-col gap-6">
            <button 
              onClick={() => setCurrentView("dashboard")}
              className={`p-2.5 rounded-xl transition-colors ${currentView === "dashboard" || currentView === "directory" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentView("emails")}
              className={`p-2.5 rounded-xl transition-colors ${currentView === "emails" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Mail className="w-5 h-5" />
            </button>
          </nav>
        </div>
        <div className="flex flex-col items-center gap-6">
          <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-2.5 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">AD</AvatarFallback>
          </Avatar>
        </div>
      </aside>

      {/* ── INNER SIDEBAR (ACCOUNTS / STATS) ── */}
      <aside className="w-72 flex-shrink-0 glass-panel border-r border-white/10 p-6 overflow-y-auto hidden md:block z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Main Stat equivalent to Net Worth */}
          <div className="pb-6 border-b border-border">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Volunteers</p>
            <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
          </div>

          {/* Stat List equivalent to Accounts */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-semibold mb-2">
                <span>Campuses</span>
                <span>{stats.campuses}</span>
              </div>
              <div className="pl-4 space-y-2.5 border-l-2 border-muted">
                {Object.entries(stats.campusCounts).map(([campus, count]) => (
                  <div key={campus} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate pr-2">{campus}</span>
                    <span className="font-medium text-foreground flex-shrink-0">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-2" />

            <div>
              <div className="flex items-center justify-between text-sm font-semibold mb-2">
                <span>Accommodations</span>
                <span>{stats.rooms}</span>
              </div>
              <div className="pl-4 space-y-2.5 border-l-2 border-muted">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rooms Assigned</span>
                  <span className="font-medium text-foreground">{stats.rooms}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Partnerships</span>
                  <span className="font-medium text-foreground">{stats.pairs}</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <Button variant="outline" className="w-full text-primary border-primary/20 hover:bg-primary/5 font-medium rounded-xl h-10">
              + Generate Report
            </Button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {currentView === "dashboard" && (
            <>
              {/* ── DARK HERO SECTION ── */}
              <div className="mb-8">
                <div className="max-w-6xl mx-auto">
                  <header className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                      <p className="text-sm text-white/60 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="glass-panel-inner text-white px-4 py-2 rounded-xl border-white/10 font-medium shadow-none">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] mr-2 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        System Operational
                      </Badge>
                    </div>
                  </header>

                  {/* KPI Cards Row (Glassmorphism) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                
                    {/* Card 1: Total Volunteers — Real Campus Distribution Bars */}
                    <div className="glass-panel rounded-3xl p-6 text-white transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Total Volunteers</p>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.total} <span className="text-xl text-white/60 font-medium">People</span></span>
                      </div>

                      {/* Campus Distribution Bar Chart */}
                      <div className="flex items-end gap-2 mb-1" style={{ height: '112px' }}>
                        {Object.entries(stats.campusCounts).map(([campus, count], i) => {
                          const maxCount = Math.max(...(Object.values(stats.campusCounts) as number[]));
                          const heightPx = Math.max(16, ((count as number) / maxCount) * 92);
                          const colors = ['#f59e0b','#a78bfa','#38bdf8','#f87171','#34d399','#fb923c'];
                          const words = campus.split(' ');
                          const label = words.length > 1 ? words[words.length - 2] || words[0] : words[0];
                          return (
                            <div
                              key={campus}
                              className="flex flex-col items-center justify-end flex-1 h-full gap-2 group cursor-pointer"
                              title={`View ${campus} volunteers`}
                              onClick={() => {
                                setTableFilter(campus);
                                setCurrentView("directory");
                              }}
                            >
                              <div
                                className="w-full rounded-md group-hover:scale-y-105 group-hover:brightness-125 origin-bottom"
                                style={{
                                  height: `${heightPx}px`,
                                  backgroundColor: colors[i % colors.length],
                                  opacity: 0.85,
                                  transition: 'all 0.2s ease',
                                  boxShadow: `0 0 12px ${colors[i % colors.length]}55`,
                                }}
                              />
                              <span className="text-[10px] text-white/40 truncate w-full text-center group-hover:text-white transition-colors pb-1">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 2: Rooms Assigned (Mimicking "Site Power Use") */}
                    <div className="glass-panel rounded-3xl p-6 text-white transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Rooms Assigned</p>
                        <DoorOpen className="w-4 h-4 text-[#ff8c00]" />
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.rooms} <span className="text-xl text-white/60 font-medium">Rooms</span></span>
                      </div>
                      
                      <div className="glass-panel-inner rounded-xl p-3 flex justify-between items-center text-sm mb-6">
                        <span className="text-white/70">Partnerships</span>
                        <span className="font-medium">{stats.pairs} Pairs Active</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          {Array.from({length: 30}).map((_, i) => (
                            <div key={i} className={`w-1.5 h-4 rounded-sm ${i < (stats.rooms/stats.total)*30 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'bg-white/10'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Keys Collected — SVG Circular Progress Ring */}
                    <div className="glass-panel rounded-3xl p-6 text-white transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Keys Collected</p>
                        <Key className="w-4 h-4 text-[#ff8c00]" />
                      </div>
                      <div className="mb-4 flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.keysCollected}</span>
                        <span className="text-xl text-white/60 font-medium">/ {stats.total}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* SVG Ring */}
                        <div className="relative flex-shrink-0">
                          <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                            <circle
                              cx="36" cy="36" r="28" fill="none"
                              stroke="#10b981"
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - (stats.total > 0 ? stats.keysCollected / stats.total : 0))}`}
                              transform="rotate(-90 36 36)"
                              style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#10b981]">
                            {stats.total > 0 ? Math.round((stats.keysCollected / stats.total) * 100) : 0}%
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span><span className="text-white/70">Collected: <span className="font-semibold text-white">{stats.keysCollected}</span></span></div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span className="text-white/70">Pending: <span className="font-semibold text-white">{stats.keysPending}</span></span></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Keys Pending — Campus-wise Pending Breakdown */}
                    <div className="glass-panel rounded-3xl p-6 text-white transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">Keys Pending</p>
                        <KeyRound className="w-4 h-4 text-[#ff8c00]" />
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.keysPending} <span className="text-xl text-white/60 font-medium">People</span></span>
                      </div>

                      {/* Action List for Pending Volunteers */}
                      <div className="space-y-3 h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {volunteers
                          .filter(v => !v.keysCollected)
                          .slice(0, 10) // Show top 10 pending to prevent overwhelming the card
                          .map(v => (
                          <div key={v.reg} className="glass-panel-inner rounded-xl p-3 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-semibold">{v.name}</h4>
                                <p className="text-xs text-white/60">{v.campus.split(' ')[0]} • Room {v.room}</p>
                              </div>
                              <span className="text-[10px] px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md whitespace-nowrap">Partner: {v.partner.split(' ')[0]}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
                              <span className="text-[10px] text-white/40 flex items-center gap-1">
                                {emailsList.some(e => e.recipientName === v.name && e.status === "sent") 
                                  ? <><Mail className="w-3 h-3 text-[#10b981]" /> Email sent</>
                                  : <><Clock className="w-3 h-3 text-amber-400" /> No email yet</>
                                }
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 text-[10px] bg-white/5 hover:bg-[#10b981]/20 hover:text-[#10b981] text-white/70 rounded-md px-2"
                                onClick={() => {
                                  const updated = [...volunteers];
                                  const idx = updated.findIndex(vol => vol.reg === v.reg);
                                  if(idx !== -1) updated[idx].keysCollected = true;
                                  setVolunteers(updated);
                                }}
                              >
                                Mark Collected ✓
                              </Button>
                            </div>
                          </div>
                        ))}
                        {stats.keysPending === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-white/40">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-[#10b981]/50" />
                            <p className="text-sm">All keys collected!</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
          {/* Top Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Search Widget (Takes 2 columns) */}
            <Card className="lg:col-span-2 glass-panel border-0 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  Volunteer Lookup
                  <div className="flex gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreVertical className="h-4 w-4 text-muted-foreground"/></Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    placeholder="Enter Registration Number (e.g. CAPS-2024-001)"
                    className="pl-12 h-14 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-base font-mono placeholder:font-sans"
                    spellCheck={false}
                  />
                  <Button onClick={() => doSearch()} disabled={result === "loading" || !query.trim()} className="h-14 px-8 rounded-xl font-medium shadow-sm transition-transform active:scale-95">
                    Search
                  </Button>
                </div>
                
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {["2524443", "2524449", "2524457", "2524454"].map((r) => (
                    <button 
                      key={r} 
                      onClick={() => quickFill(r)} 
                      className="whitespace-nowrap font-mono text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Result Widget (Takes 1 column) */}
            <Card className="glass-panel border-0 rounded-2xl overflow-hidden flex flex-col">
              <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Result</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                {result === "idle" && (
                  <div className="text-center text-muted-foreground space-y-3 py-4">
                    <Search className="w-8 h-8 mx-auto opacity-20" />
                    <p className="text-sm">Search to view details</p>
                  </div>
                )}
                
                {result === "loading" && (
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                )}

                {result === "not-found" && (
                  <div className="text-center text-muted-foreground space-y-3 py-4">
                    <X className="w-8 h-8 mx-auto text-destructive opacity-50" />
                    <p className="text-sm text-foreground font-medium">Record not found</p>
                  </div>
                )}

                {result !== "idle" && result !== "loading" && result !== "not-found" && (
                  <div className="animate-in fade-in slide-up duration-300">
                    <div className="flex items-center gap-4 mb-5">
                      <Avatar className="w-12 h-12 rounded-full">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {initials(result.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{result.name}</h3>
                        <p className="text-xs font-mono text-muted-foreground">{result.reg}</p>
                      </div>
                    </div>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Campus</span>
                        <span className="font-medium">{result.campus}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Room</span>
                        <span className="font-medium font-mono">{result.room}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Partner</span>
                        <span className="font-medium">{result.partner}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">Key Status</span>
                        {result.keysCollected ? (
                          <span className="text-sm font-semibold text-green-600">Collected</span>
                        ) : (
                          <span className="text-sm font-semibold text-amber-600">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      {result.keysCollected ? (
                        <Button variant="outline" className="w-full text-green-700 border-green-200 hover:bg-green-50" onClick={() => {
                          const v = volunteers.find(v => v.reg === result.reg);
                          if (v) { v.keysCollected = false; setResult({...v}); }
                        }}>
                          Mark as Pending
                        </Button>
                      ) : (
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                          const v = volunteers.find(v => v.reg === result.reg);
                          if (v) { 
                            v.keysCollected = true; 
                            setResult({...v}); 
                            // Mock scheduling an email
                            if (v.partner) {
                              const newEmail: EmailEvent = {
                                id: `EML-${Date.now()}`,
                                recipientName: v.partner,
                                recipientEmail: `${v.partner.toLowerCase().replace(/ /g, '.')}@example.com`,
                                subject: "Your Roommate Has Collected Keys",
                                status: "scheduled",
                                timestamp: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // scheduled for 5 mins from now
                              };
                              setEmailsList(prev => [newEmail, ...prev]);
                              toast.success(`Email scheduled for partner: ${v.partner}`);
                            }
                          }
                        }}>
                          Mark Keys Collected
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
          </>
          )}

          {/* Directory Table Widget (Full width) */}
          {currentView !== "emails" && (
          <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 p-6 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  {currentView === "directory" && (
                    <Button variant="ghost" size="icon" onClick={() => setCurrentView("dashboard")} className="-ml-2 h-8 w-8 rounded-full">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </Button>
                  )}
                  <CardTitle className="text-lg font-semibold">Volunteer Directory</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Manage and view all registered assignments</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    placeholder="Filter list..."
                    className="pl-9 h-9 w-64 bg-muted/50 border-border/50 rounded-lg text-sm"
                  />
                </div>
                <Button variant="outline" className="h-9 rounded-lg">Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/50">
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volunteer Name</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campus</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Partner</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Status</TableHead>
                      <TableHead className="h-11 px-6 w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No matches found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (currentView === "dashboard" ? filtered.slice(0, 5) : filtered).map((v) => (
                        <TableRow
                          key={v.reg}
                          className="group cursor-pointer hover:bg-muted/30 transition-colors border-b-border/50"
                          onClick={() => {
                            setQuery(v.reg);
                            doSearch(v.reg);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <TableCell className="px-6 py-3.5">
                            <span className="font-mono text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded-md">
                              {v.reg}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-7 h-7 rounded-full">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                  {initials(v.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-foreground">{v.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">{v.campus}</TableCell>
                          <TableCell className="px-6 py-3.5">
                            <span className="font-mono text-xs font-medium text-muted-foreground">
                              {v.room}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">{v.partner}</TableCell>
                          <TableCell className="px-6 py-3.5">
                            {v.keysCollected ? (
                              <span className="text-sm font-semibold text-green-600">Collected</span>
                            ) : (
                              <span className="text-sm font-semibold text-amber-600">Pending</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {currentView === "dashboard" && filtered.length > 5 && (
                <div className="p-4 border-t border-border/50 bg-muted/10 text-center">
                  <Button onClick={() => setCurrentView("directory")} variant="ghost" className="text-primary hover:text-primary font-medium hover:bg-primary/5 text-sm w-full rounded-lg">
                    See All Volunteers
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* ── EMAILS DASHBOARD ── */}
          {currentView === "emails" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Email Delivery</h1>
                  <p className="text-sm text-white/60 mt-1">Track and manage automated communications</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="glass-panel text-white border-white/10" onClick={() => toast.success('Connection test passed!')}>
                    <Send className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </header>

              {/* ── ROW 1: KPI Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Emails', value: emailStats.total, color: '#a78bfa', icon: Mail },
                  { label: 'Successfully Sent', value: emailStats.sent, color: '#10b981', icon: CheckCircle2 },
                  { label: 'Pending / Queued', value: emailStats.pending + emailStats.scheduled, color: '#f59e0b', icon: Clock },
                  { label: 'Failed', value: emailStats.failed, color: '#ef4444', icon: AlertCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="glass-panel rounded-2xl p-5 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs font-semibold tracking-wider text-white/50 uppercase">{label}</p>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-4xl font-bold" style={{ color }}>{value}</p>
                    <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${emailStats.total > 0 ? (value / emailStats.total) * 100 : 0}%`, backgroundColor: color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── ROW 2: Timeline + Pie Chart ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Hourly Activity Timeline */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden lg:col-span-2">
                  <CardHeader className="px-6 py-4 border-b border-white/10">
                    <CardTitle className="text-sm font-bold">Hourly Activity Timeline</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Emails sent per hour (last 12 hours)</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData} barSize={14}>
                          <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ background: 'rgba(30,31,43,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            cursor={false}
                          />
                          <Bar dataKey="emails" fill="#a78bfa" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Donut */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-white/10">
                    <CardTitle className="text-sm font-bold">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={emailPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none">
                            {emailPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'rgba(30,31,43,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} cursor={false} />
                          <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── ROW 3: Campus Delivery Rates + Broadcast Panel ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Campus Delivery Rates */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-white/10">
                    <CardTitle className="text-sm font-bold">Delivery Rate by Campus</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Success rate of emails per campus</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {campusDelivery.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No email data yet. Trigger some emails first.</p>
                    ) : campusDelivery.map(({ campus, label, rate, sent, total }) => (
                      <div key={campus}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-white/80">{label}</span>
                          <span className="text-xs text-muted-foreground">{sent}/{total} sent · <span className="font-semibold" style={{ color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>{rate}%</span></span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${rate}%`,
                              backgroundColor: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444',
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {campusDelivery.length === 0 && (
                      <div className="text-center text-muted-foreground py-6">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No campus delivery data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Broadcast Panel */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-white/10">
                    <CardTitle className="text-sm font-bold">Broadcast Panel</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Trigger a bulk email to a campus group</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Select Campus</label>
                      <div className="flex flex-wrap gap-2">
                        {['All Campuses', ...Object.keys(stats.campusCounts).map(c => c.split(' ').slice(-2,-1)[0] || c)].map((c, i) => (
                          <button
                            key={c}
                            onClick={() => setBroadcastCampus(i === 0 ? 'All Campuses' : Object.keys(stats.campusCounts)[i-1])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              broadcastCampus === (i === 0 ? 'All Campuses' : Object.keys(stats.campusCounts)[i-1])
                                ? 'bg-primary text-white'
                                : 'glass-panel-inner text-white/60 hover:text-white'
                            }`}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Email Trigger</label>
                      <div className="flex flex-col gap-2">
                        {['Key Collection Reminder', 'Room Assignment Notice', 'Event Schedule Update', 'Emergency Alert'].map(trigger => (
                          <button
                            key={trigger}
                            onClick={() => setBroadcastTrigger(trigger)}
                            className={`px-4 py-2.5 rounded-xl text-sm text-left font-medium transition-all flex items-center gap-3 ${
                              broadcastTrigger === trigger
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'glass-panel-inner text-white/60 hover:text-white border border-transparent'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${broadcastTrigger === trigger ? 'bg-primary' : 'bg-white/20'}`} />
                            {trigger}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl h-11"
                      onClick={() => {
                        const targets = broadcastCampus === 'All Campuses' ? volunteers : volunteers.filter(v => v.campus === broadcastCampus);
                        const newEmails: EmailEvent[] = targets.map(v => ({
                          id: `EML-${Date.now()}-${v.reg}`,
                          recipientName: v.name,
                          recipientEmail: `${v.name.toLowerCase().replace(/ /g, '.')}@example.com`,
                          subject: broadcastTrigger,
                          status: 'scheduled',
                          timestamp: new Date(Date.now() + 1000 * 60 * 2).toISOString(),
                        }));
                        setEmailsList(prev => [...newEmails, ...prev]);
                        toast.success(`${newEmails.length} emails queued for ${broadcastCampus}`);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to {broadcastCampus === 'All Campuses' ? `All ${volunteers.length} Volunteers` : `${broadcastCampus.split(' ').slice(-2,-1)[0] || broadcastCampus} Campus`}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* ── ROW 4: Email Log ── */}
              <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-6 pb-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">Email Log</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Recent automated messages</p>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/50">
                          <TableHead className="font-semibold text-foreground px-6 py-4">Recipient</TableHead>
                          <TableHead className="font-semibold text-foreground px-6 py-4">Subject</TableHead>
                          <TableHead className="font-semibold text-foreground px-6 py-4">Status</TableHead>
                          <TableHead className="font-semibold text-foreground px-6 py-4">Timestamp</TableHead>
                          <TableHead className="font-semibold text-foreground px-6 py-4">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailsList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                              No emails found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          emailsList.map((email) => (
                            <TableRow key={email.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                              <TableCell className="px-6 py-3.5">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-sm text-foreground">{email.recipientName}</span>
                                  <span className="text-xs text-muted-foreground">{email.recipientEmail}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-3.5 text-sm font-medium">{email.subject}</TableCell>
                              <TableCell className="px-6 py-3.5">
                                {email.status === "sent" && <span className="text-sm font-semibold text-green-500">Sent</span>}
                                {email.status === "pending" && <span className="text-sm font-semibold text-amber-500">Pending</span>}
                                {email.status === "scheduled" && <span className="text-sm font-semibold text-blue-400">Scheduled</span>}
                                {email.status === "failed" && <span className="text-sm font-semibold text-red-500">Failed</span>}
                              </TableCell>
                              <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">
                                {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </TableCell>
                              <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">
                                {email.reason ? <span className="text-red-400 text-xs">{email.reason}</span> : <span className="text-xs">--</span>}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
