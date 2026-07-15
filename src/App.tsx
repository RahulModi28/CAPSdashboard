import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { 
  Search, Users, Building2, DoorOpen, X, 
  LayoutDashboard, LogOut, 
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

import { type Volunteer } from "@/data/volunteers";
import { type EmailEvent } from "@/data/emails";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import logo from "./assets/logo.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

import { supabase } from "@/lib/supabase";

/* ══════════════════════════════════════
   MAIN DASHBOARD APP
══════════════════════════════════════ */
export default function App() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [query, setQuery] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [result, setResult] = useState<Volunteer | "not-found" | "idle" | "loading">("idle");
  const [currentView, setCurrentView] = useState<"dashboard" | "directory" | "emails" | "email-list">("dashboard");
  const [emailsList, setEmailsList] = useState<EmailEvent[]>([]);
  const [emailTriggers, setEmailTriggers] = useState<any[]>([]);

  const [publicSearch, setPublicSearch] = useState("");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    async function fetchData() {
      // Fetch Volunteers
      const { data: vData } = await supabase.from('volunteers').select('*').order('created_at', { ascending: true });
      if (vData) {
        // Map database columns to the frontend interface
        const mappedV = vData.map(v => ({
          reg: v.reg_no,
          name: v.name,
          campus: v.campus,
          room: v.room,
          partner: v.partner_name,
          keysCollected: v.keys_collected,
          email: v.email
        }));
        setVolunteers(mappedV);
      }

      // Fetch Emails
      const { data: eData } = await supabase.from('email_logs').select('*').order('timestamp', { ascending: false });
      if (eData) {
        const mappedE = eData.map(e => ({
          id: e.id,
          recipientName: e.recipient_name,
          recipientEmail: e.recipient_email,
          subject: e.subject,
          status: e.status,
          timestamp: e.timestamp,
          reason: e.reason
        }));
        setEmailsList(mappedE);
      }

      // Fetch Triggers
      const { data: tData } = await supabase.from('email_triggers').select('*').order('trigger_time', { ascending: true });
      if (tData) {
        const mappedT = tData.map((t, index) => ({
          id: t.id,
          event: t.event_name,
          campus: t.target_campus,
          time: new Date(t.trigger_time),
          status: index < 4 ? 'scheduled' : 'upcoming', // mockup status based on index for now
          instant: t.is_instant
        }));
        setEmailTriggers(mappedT);
      }
    }
    
    fetchData();
  }, []);
  const [emailFilter, setEmailFilter] = useState<{ type: 'all' | 'status' | 'hour', value: string }>({ type: 'all', value: '' });
  const [now, setNow] = useState(new Date());

  // Tick every second for countdown timers
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEmails = useMemo(() => {
    if (emailFilter.type === "all") return emailsList;
    if (emailFilter.type === "status") {
      if (emailFilter.value === "pending") return emailsList.filter(e => e.status === "pending" || e.status === "scheduled");
      return emailsList.filter(e => e.status === emailFilter.value);
    }
    if (emailFilter.type === "hour") {
      const targetHour = parseInt(emailFilter.value.split(':')[0], 10);
      return emailsList.filter(e => new Date(e.timestamp).getHours() === targetHour);
    }
    return emailsList;
  }, [emailsList, emailFilter]);

  const emailPieData = useMemo(() => {
    const sent = emailsList.filter(e => e.status === "sent").length;
    const pending = emailsList.filter(e => e.status === "pending" || e.status === "scheduled").length;
    const failed = emailsList.filter(e => e.status === "failed").length;
    
    return [
      { name: 'Sent', value: sent, color: '#0284c7' }, 
      { name: 'Pending & Scheduled', value: pending, color: '#38bdf8' },
      { name: 'Failed', value: failed, color: '#7dd3fc' },
    ].filter(d => d.value > 0);
  }, [emailsList]);

  const emailStats = useMemo(() => ({
    total: emailsList.length,
    sent: emailsList.filter(e => e.status === "sent").length,
    pending: emailsList.filter(e => e.status === "pending").length,
    scheduled: emailsList.filter(e => e.status === "scheduled").length,
    failed: emailsList.filter(e => e.status === "failed").length,
  }), [emailsList]);

  const sendRealEmails = async (recipients: string[], subject: string, body: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, subject, body }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to email server");
      return false;
    }
  };

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

  const hourlyChartData = useMemo(() => {
    return {
      labels: hourlyData.map(d => d.hour),
      datasets: [
        {
          label: 'Emails',
          data: hourlyData.map(d => d.emails),
          backgroundColor: '#0ea5e9',
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  }, [hourlyData]);

  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const hourLabel = hourlyData[index].hour;
        setEmailFilter({ type: 'hour', value: hourLabel });
        setCurrentView('email-list');
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(15,23,42,0.6)', font: { size: 10 } },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { color: 'rgba(15,23,42,0.6)', font: { size: 10 }, stepSize: 1 },
        border: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#0f172a',
        bodyColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    }
  };

  const donutChartData = useMemo(() => {
    return {
      labels: emailPieData.map(d => d.name),
      datasets: [
        {
          data: emailPieData.map(d => d.value),
          backgroundColor: emailPieData.map(d => d.color),
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }, [emailPieData]);

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const label = emailPieData[index].name;
        if (label === 'Sent') setEmailFilter({ type: 'status', value: 'sent' });
        else if (label === 'Pending & Scheduled') setEmailFilter({ type: 'status', value: 'pending' });
        else if (label === 'Failed') setEmailFilter({ type: 'status', value: 'failed' });
        setCurrentView('email-list');
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(15,23,42,0.6)',
          font: { size: 11 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#0f172a',
        bodyColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        cornerRadius: 8,
      }
    }
  };

  if (showLogin) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 text-foreground selection:bg-primary/20 selection:text-primary">
        <Toaster position="top-right" theme="light" />
        <Card className="w-full max-w-md shadow-xl border-0 glass-panel">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (loginPassword === "admin123") {
                      setIsAuthenticated(true);
                      setShowLogin(false);
                      setLoginPassword("");
                      toast.success("Logged in successfully");
                    } else {
                      toast.error("Incorrect password");
                    }
                  }
                }}
              />
            </div>
            <Button className="w-full" onClick={() => {
              if (loginPassword === "admin123") {
                setIsAuthenticated(true);
                setShowLogin(false);
                setLoginPassword("");
                toast.success("Logged in successfully");
              } else {
                toast.error("Incorrect password");
              }
            }}>Login</Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowLogin(false)}>Back to Directory</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    const filteredPublicVolunteers = volunteers.filter(v => 
      (v.name && v.name.toLowerCase().includes(publicSearch.toLowerCase())) ||
      (v.reg && v.reg.toLowerCase().includes(publicSearch.toLowerCase())) ||
      (v.room && v.room.toLowerCase().includes(publicSearch.toLowerCase())) ||
      (v.partner && v.partner.toLowerCase().includes(publicSearch.toLowerCase()))
    );

    return (
      <div className="flex flex-col h-screen w-full overflow-hidden text-foreground selection:bg-primary/20 selection:text-primary">
        <Toaster position="top-right" theme="light" />
        {/* Header */}
        <header className="h-16 flex-shrink-0 glass-panel border-b border-slate-300/60 flex items-center justify-between px-6 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center premium-shadow">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Public Directory</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <Button variant="ghost" className="text-base font-medium text-muted-foreground hover:text-foreground px-4">Maps</Button>
            <Button variant="ghost" className="text-base font-medium bg-white/20 text-foreground px-4">Room List</Button>
            <Button variant="ghost" className="text-base font-medium text-muted-foreground hover:text-foreground px-4" onClick={() => window.location.href = '/leaderboard'}>Scoreboard</Button>
          </nav>

          <Button variant="outline" size="sm" onClick={() => setShowLogin(true)} className="glass-panel hover:bg-white/50 border-slate-300/60 transition-colors shadow-none font-medium">
            Admin Login
          </Button>
        </header>

        {/* Directory Table */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Card className="glass-panel border border-slate-300/60 rounded-2xl overflow-hidden premium-shadow">
              <CardHeader className="border-b border-slate-300/60 bg-white/20 pb-4 backdrop-blur-md flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold tracking-tight">Volunteer Assignments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search name, reg, room..."
                    className="pl-9 h-9 bg-white/50 border-slate-300/60 focus-visible:ring-primary/20 transition-all"
                    value={publicSearch}
                    onChange={(e) => setPublicSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-200/50 backdrop-blur-md sticky top-0 border-b border-slate-300/60">
                      <tr>
                        <th className="px-6 py-4 font-semibold tracking-wider">Reg ID</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Roommate</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Room</th>
                        <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300/60 bg-white/30 backdrop-blur-sm">
                      {filteredPublicVolunteers.map((v) => (
                        <tr key={v.reg} className="hover:bg-white/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-600">{v.reg}</td>
                          <td className="px-6 py-4 font-medium text-foreground">{v.name}</td>
                          <td className="px-6 py-4 font-medium text-muted-foreground">{v.partner || "-"}</td>
                          <td className="px-6 py-4 font-mono font-medium text-slate-700">{v.room}</td>
                          <td className="px-6 py-4 font-medium">
                            {v.keysCollected ? (
                              <span className="text-green-600 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Collected
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground selection:bg-primary/20 selection:text-primary">
      <Toaster position="top-right" theme="light" />

      {/* ── THIN LEFT SIDEBAR ── */}
      <aside className="w-16 flex-shrink-0 glass-panel border-r border-slate-300/60 flex flex-col items-center py-6 justify-between z-20">
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
          <button 
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors"
            onClick={() => {
              setIsAuthenticated(false);
              toast.info("Logged out successfully");
            }}
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
          <Avatar className="w-9 h-9 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">AD</AvatarFallback>
          </Avatar>
        </div>
      </aside>

      {/* ── INNER SIDEBAR (ACCOUNTS / STATS) ── */}
      <aside className="w-72 flex-shrink-0 glass-panel border-r border-slate-300/60 p-6 overflow-y-auto hidden md:block z-10">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="w-full h-auto object-contain" />
        </div>

        {/* ── OVERVIEW (Dashboard / Directory) ── */}
        {(currentView === "dashboard" || currentView === "directory") && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <div className="pb-6 border-b border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Volunteers</p>
                <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
              </div>
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
                      <span>Roommates</span>
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
          </>
        )}

        {/* ── SCHEDULED QUEUE (Emails / Email-list) ── */}
        {(currentView === "emails" || currentView === "email-list") && (() => {
          return (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Scheduled Queue</h2>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
              </div>

              {/* Upcoming trigger events */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming Events</p>
              <div className="space-y-1">
                {emailTriggers.map((trigger) => {
                  const diff = Math.max(0, Math.floor((trigger.time.getTime() - now.getTime()) / 1000));
                  const hrs = Math.floor(diff / 3600);
                  const mins = Math.floor((diff % 3600) / 60);
                  const isImminent = !trigger.instant && diff < 600;
                  return (
                    <div key={trigger.id} className="py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${trigger.instant ? 'text-sky-600' : 'text-foreground'}`}>{trigger.event}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{trigger.campus}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {trigger.instant ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                              </span>
                              <span className="text-[11px] font-bold text-sky-600">Instant</span>
                            </span>
                          ) : (
                            <p className={`text-[11px] font-bold tabular-nums ${isImminent ? 'text-sky-600' : 'text-slate-500'}`}>
                              {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />
              <Button
                variant="outline"
                className="w-full text-primary border-primary/20 hover:bg-primary/5 font-medium rounded-xl h-10"
                onClick={() => { setEmailFilter({ type: 'all', value: '' }); setCurrentView('email-list'); }}
              >
                View Full Email Log
              </Button>
            </>
          );
        })()}
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
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                      <p className="text-sm text-slate-600 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="glass-panel-inner text-slate-900 px-4 py-2 rounded-xl border-slate-300/60 font-medium shadow-none">
                        <span className="w-2 h-2 rounded-full bg-[#0284c7] mr-2 inline-block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        System Operational
                      </Badge>
                    </div>
                  </header>

                  {/* KPI Cards Row (Glassmorphism) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                
                    {/* Card 1: Total Volunteers — Real Campus Distribution Bars */}
                    <div className="glass-panel rounded-3xl p-6 text-slate-900 transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Total Volunteers</p>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.total} <span className="text-xl text-slate-600 font-medium">People</span></span>
                      </div>

                      {/* Campus Distribution Bar Chart */}
                      <div className="flex items-end gap-2 mb-1" style={{ height: '112px' }}>
                        {Object.entries(stats.campusCounts).map(([campus, count], i) => {
                          const maxCount = Math.max(...(Object.values(stats.campusCounts) as number[]));
                          const heightPx = Math.max(16, ((count as number) / maxCount) * 92);
                          const colors = ['#38bdf8','#0ea5e9','#38bdf8','#7dd3fc','#0284c7','#38bdf8'];
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
                              <span className="text-[10px] text-slate-500 truncate w-full text-center group-hover:text-slate-900 transition-colors pb-1">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 2: Rooms Assigned (Mimicking "Site Power Use") */}
                    <div className="glass-panel rounded-3xl p-6 text-slate-900 transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Rooms Assigned</p>
                        <DoorOpen className="w-4 h-4 text-[#0ea5e9]" />
                      </div>
                      <div className="mb-6">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.rooms} <span className="text-xl text-slate-600 font-medium">Rooms</span></span>
                      </div>
                      
                      <div className="glass-panel-inner rounded-xl p-3 flex justify-between items-center text-sm mb-6">
                        <span className="text-slate-700">Roommates</span>
                        <span className="font-medium">{stats.pairs} Roommate Pairs</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          {Array.from({length: 30}).map((_, i) => (
                            <div key={i} className={`w-1.5 h-4 rounded-sm ${i < (stats.rooms/stats.total)*30 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]' : 'bg-white/80'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Keys Collected — SVG Circular Progress Ring */}
                    <div className="glass-panel rounded-3xl p-6 text-slate-900 transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Keys Collected</p>
                        <Key className="w-4 h-4 text-[#0ea5e9]" />
                      </div>
                      <div className="mb-4 flex items-baseline gap-2">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.keysCollected}</span>
                        <span className="text-xl text-slate-600 font-medium">/ {stats.total}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* SVG Ring */}
                        <div className="relative flex-shrink-0">
                          <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                            <circle
                              cx="36" cy="36" r="28" fill="none"
                              stroke="#0284c7"
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - (stats.total > 0 ? stats.keysCollected / stats.total : 0))}`}
                              transform="rotate(-90 36 36)"
                              style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#0284c7]">
                            {stats.total > 0 ? Math.round((stats.keysCollected / stats.total) * 100) : 0}%
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0284c7]"></span><span className="text-slate-700">Collected: <span className="font-semibold text-slate-900">{stats.keysCollected}</span></span></div>
                          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-400"></span><span className="text-slate-700">Pending: <span className="font-semibold text-slate-900">{stats.keysPending}</span></span></div>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Keys Pending — Campus-wise Pending Breakdown */}
                    <div className="glass-panel rounded-3xl p-6 text-slate-900 transition-all hover:scale-[1.01] duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Keys Pending</p>
                        <KeyRound className="w-4 h-4 text-[#0ea5e9]" />
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">{stats.keysPending} <span className="text-xl text-slate-600 font-medium">People</span></span>
                      </div>

                      {/* Action List for Pending Volunteers */}
                      <div className="space-y-3 h-[230px] overflow-y-auto pr-2 custom-scrollbar">
                        {volunteers
                          .filter(v => !v.keysCollected)
                          .slice(0, 10) // Show top 10 pending to prevent overwhelming the card
                          .map(v => (
                          <div key={v.reg} className="glass-panel-inner rounded-xl p-3 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-semibold">{v.name}</h4>
                                <p className="text-xs text-slate-600">{v.campus.split(' ')[0]} • Room {v.room}</p>
                              </div>
                              <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md whitespace-nowrap font-medium">Roommate: {v.partner.split(' ')[0]}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-300/40">
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                {emailsList.some(e => e.recipientName === v.name && e.status === "sent") 
                                  ? <><Mail className="w-3 h-3 text-[#0284c7]" /> Email sent</>
                                  : <><Clock className="w-3 h-3 text-blue-500" /> No email yet</>
                                }
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 text-[10px] bg-white/60 hover:bg-[#0284c7]/20 hover:text-[#0284c7] text-slate-700 rounded-md px-2"
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
                          <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <CheckCircle2 className="w-8 h-8 mb-2 text-[#0284c7]/50" />
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
                      className="whitespace-nowrap font-mono text-sm font-semibold text-slate-500 hover:text-primary transition-colors hover:underline"
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
                        <h3 className="font-semibold text-foreground text-lg">
                          {result.name && result.name.length > 15 ? result.name.split(' ')[0] : result.name}
                        </h3>
                        <p className="text-xs font-mono text-muted-foreground">{result.reg}</p>
                      </div>
                    </div>
                    <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                      <div className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0">Campus</span>
                        <span className="font-medium text-right">{result.campus}</span>
                      </div>
                      <div className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0">Room</span>
                        <span className="font-medium font-mono text-right">{result.room}</span>
                      </div>
                      <div className="flex justify-between items-start gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0">Roommate</span>
                        <span className="font-medium text-right">
                          {result.partner && result.partner.length > 12 ? result.partner.split(' ')[0] : result.partner}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">Key Status</span>
                        {result.keysCollected ? (
                          <span className="text-sm font-semibold text-green-600">Collected</span>
                        ) : (
                          <span className="text-sm font-semibold text-sky-600">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
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
                          }
                        }}>
                          Mark Keys Collected
                        </Button>
                      )}

                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={async () => {
                        const v = volunteers.find(v => v.reg === result.reg);
                        if (v && v.partner) {
                          const recipientEmail = `${v.partner.toLowerCase().replace(/ /g, '.')}@example.com`;
                          const subject = "Your Roommate Has Collected Keys";
                          const body = `<p>Hello ${v.partner},</p><p>Your roommate ${v.name} has successfully collected the room keys.</p>`;
                          
                          const success = await sendRealEmails([recipientEmail], subject, body);
                          
                          if (success) {
                            const newEmail: EmailEvent = {
                              id: `EML-${Date.now()}`,
                              recipientName: v.partner,
                              recipientEmail,
                              subject,
                              status: "scheduled",
                              timestamp: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
                            };
                            setEmailsList(prev => [newEmail, ...prev]);
                            toast.success(`Email scheduled for roommate: ${v.partner}`);
                          }
                        } else {
                          toast.error("No roommate found to send an email to.");
                        }
                      }}>
                        Send Roommate Email
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
          </>
          )}

          {/* Directory Table Widget (Full width) */}
          {(currentView === "dashboard" || currentView === "directory") && (
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
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roommate</TableHead>
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
                            <span className="font-mono text-sm font-semibold text-slate-700">
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
                              <span className="text-sm font-semibold text-sky-600">Pending</span>
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
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email Delivery</h1>
                  <p className="text-sm text-slate-600 mt-1">Track and manage automated communications</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="glass-panel text-slate-900 border-slate-300/60" 
                    onClick={async () => {
                      toast.loading('Testing connection...');
                      const success = await sendRealEmails(['test@example.com'], 'CAPS Email Test', '<p>This is a test connection from CAPS Dashboard.</p>');
                      toast.dismiss();
                      if (success) toast.success('Connection test passed! Emails can be sent.');
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </header>

              {/* ── ROW 1: KPI Cards ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Emails', value: emailStats.total, color: '#0ea5e9', icon: Mail },
                  { label: 'Successfully Sent', value: emailStats.sent, color: '#0284c7', icon: CheckCircle2 },
                  { label: 'Pending / Queued', value: emailStats.pending + emailStats.scheduled, color: '#38bdf8', icon: Clock },
                  { label: 'Failed', value: emailStats.failed, color: '#7dd3fc', icon: AlertCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="glass-panel rounded-2xl p-5 text-slate-900">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{label}</p>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-4xl font-bold" style={{ color }}>{value}</p>
                    <div className="mt-3 h-1 bg-white/80 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${emailStats.total > 0 ? (value / emailStats.total) * 100 : 0}%`, backgroundColor: color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── ROW 2: Timeline + Pie Chart ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Hourly Activity Timeline */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden lg:col-span-2">
                  <CardHeader className="px-6 py-4 border-b border-slate-300/60">
                    <CardTitle className="text-sm font-bold">Hourly Activity Timeline</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Emails sent per hour (last 12 hours)</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[180px]">
                      <Bar data={hourlyChartData} options={hourlyChartOptions} />
                    </div>
                  </CardContent>
                </Card>

                {/* Status Donut */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-slate-300/60">
                    <CardTitle className="text-sm font-bold">Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[210px] pb-2">
                      <Doughnut data={donutChartData} options={donutChartOptions} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── ROW 3: Campus Delivery Rates + Broadcast Panel ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Campus Delivery Rates */}
                <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                  <CardHeader className="px-6 py-4 border-b border-slate-300/60">
                    <CardTitle className="text-sm font-bold">Delivery Rate by Campus</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Success rate of emails per campus</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {campusDelivery.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No email data yet. Trigger some emails first.</p>
                    ) : campusDelivery.map(({ campus, label, rate, sent, total }) => (
                      <div key={campus}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-slate-800">{label}</span>
                          <span className="text-xs text-muted-foreground">{sent}/{total} sent · <span className="font-semibold" style={{ color: rate >= 80 ? '#0284c7' : rate >= 50 ? '#38bdf8' : '#7dd3fc' }}>{rate}%</span></span>
                        </div>
                        <div className="h-2 bg-white/80 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${rate}%`,
                              backgroundColor: rate >= 80 ? '#0284c7' : rate >= 50 ? '#38bdf8' : '#7dd3fc',
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
                  <CardHeader className="px-6 py-4 border-b border-slate-300/60">
                    <CardTitle className="text-sm font-bold">Broadcast Panel</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Trigger a bulk email to a campus group</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Select Campus</label>
                      <div className="flex flex-wrap gap-2">
                        {['All Campuses', ...Object.keys(stats.campusCounts).map(c => c.split(' ').slice(-2,-1)[0] || c)].map((c, i) => (
                          <button
                            key={c}
                            onClick={() => setBroadcastCampus(i === 0 ? 'All Campuses' : Object.keys(stats.campusCounts)[i-1])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              broadcastCampus === (i === 0 ? 'All Campuses' : Object.keys(stats.campusCounts)[i-1])
                                ? 'bg-primary text-slate-900'
                                : 'glass-panel-inner text-slate-600 hover:text-slate-900'
                            }`}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Email Trigger</label>
                      <div className="flex flex-col gap-2">
                        {['Key Collection Reminder', 'Room Assignment Notice', 'Event Schedule Update', 'Emergency Alert'].map(trigger => (
                          <button
                            key={trigger}
                            onClick={() => setBroadcastTrigger(trigger)}
                            className={`px-4 py-2.5 rounded-xl text-sm text-left font-medium transition-all flex items-center gap-3 ${
                              broadcastTrigger === trigger
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'glass-panel-inner text-slate-600 hover:text-slate-900 border border-transparent'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${broadcastTrigger === trigger ? 'bg-primary' : 'bg-white'}`} />
                            {trigger}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-semibold rounded-xl h-11"
                      onClick={async () => {
                        const targets = broadcastCampus === 'All Campuses' ? volunteers : volunteers.filter(v => v.campus === broadcastCampus);
                        
                        toast.loading(`Sending ${targets.length} emails...`);
                        
                        // Extract emails from targets
                        const recipientEmails = targets.map(v => `${v.name.toLowerCase().replace(/ /g, '.')}@example.com`);
                        
                        // Using a dummy body for the demo based on the trigger
                        const body = `
                          <h2>Hello CAPS Volunteer</h2>
                          <p>This is an automated notification regarding: <strong>${broadcastTrigger}</strong></p>
                          <br>
                          <p>Thank you,<br>CAPS Team</p>
                        `;

                        const success = await sendRealEmails(recipientEmails, broadcastTrigger, body);
                        
                        toast.dismiss();

                        if (success) {
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
                        }
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to {broadcastCampus === 'All Campuses' ? `All ${volunteers.length} Volunteers` : `${broadcastCampus.split(' ').slice(-2,-1)[0] || broadcastCampus} Campus`}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* ── ROW 4: Scheduled Queue ── */}
              {(() => {
                const scheduled = emailsList.filter(e => e.status === 'scheduled' && new Date(e.timestamp) > now);
                if (scheduled.length === 0) return null;
                return (
                  <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-300/60 px-6 py-4">
                      <div>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                          </span>
                          Scheduled Queue
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{scheduled.length} email{scheduled.length !== 1 ? 's' : ''} pending dispatch</p>
                      </div>
                      <Badge className="bg-violet-100 text-violet-700 border-0 text-xs font-semibold">{scheduled.length} queued</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border/40">
                        {scheduled.slice(0, 6).map((email) => {
                          const diff = Math.max(0, Math.floor((new Date(email.timestamp).getTime() - now.getTime()) / 1000));
                          const mins = Math.floor(diff / 60);
                          const secs = diff % 60;
                          const pct = Math.min(100, Math.max(0, 100 - (diff / 300) * 100));
                          return (
                            <li key={email.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-violet-100 text-violet-700 text-[10px] font-bold">
                                  {email.recipientName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{email.recipientName}</p>
                                <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                                <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden w-32">
                                  <div className="h-full rounded-full bg-violet-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold tabular-nums text-violet-600">
                                  {mins}:{secs.toString().padStart(2, '0')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">until send</p>
                              </div>
                            </li>
                          );
                        })}
                        {scheduled.length > 6 && (
                          <li className="px-6 py-3 text-center text-xs text-muted-foreground">+{scheduled.length - 6} more scheduled</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* ── ROW 5: Email Log Link ── */}
              <div className="flex justify-center pt-4">
                <Button variant="ghost" className="text-primary hover:bg-primary/10" onClick={() => { setEmailFilter({ type: 'all', value: '' }); setCurrentView('email-list'); }}>
                  View Full Email Log
                </Button>
              </div>

            </div>
          )}

          {/* ── EMAIL LIST VIEW ── */}
          {currentView === "email-list" && (
          <Card className="glass-panel border-0 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 p-6 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentView("emails")} className="-ml-2 h-8 w-8 rounded-full">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </Button>
                  <CardTitle className="text-lg font-semibold">Email Log</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {emailFilter.type !== "all"
                    ? `Filtered by: ${emailFilter.value} · ${filteredEmails.length} result${filteredEmails.length !== 1 ? "s" : ""}`
                    : "All automated messages"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {emailFilter.type !== "all" && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer px-2 py-1 flex items-center gap-1"
                    onClick={() => setEmailFilter({ type: "all", value: "" })}
                  >
                    Clear filter <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                <Button variant="outline" className="h-9 rounded-lg">Export</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/50">
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipient</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Sent</TableHead>
                      <TableHead className="h-11 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No emails found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmails.map((email) => (
                        <TableRow key={email.id} className="group hover:bg-muted/30 transition-colors border-b-border/50">
                          <TableCell className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-7 h-7 rounded-full">
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                  {email.recipientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-foreground">{email.recipientName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3.5">
                            <span className="font-mono text-xs font-medium text-muted-foreground">{email.recipientEmail}</span>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-sm font-medium text-foreground">{email.subject}</TableCell>
                          <TableCell className="px-6 py-3.5">
                            {email.status === "sent" && <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Sent</div>}
                            {email.status === "pending" && <div className="flex items-center gap-1.5 text-sky-600 text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>Pending</div>}
                            {email.status === "scheduled" && <div className="flex items-center gap-1.5 text-violet-600 text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>Scheduled</div>}
                            {email.status === "failed" && <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>Failed</div>}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">
                            {new Date(email.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-sm text-muted-foreground">
                            {email.reason
                              ? <span className="text-rose-500 text-xs font-medium">{email.reason}</span>
                              : <span className="text-xs text-muted-foreground font-medium">--</span>}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          )}

        </div>
      </main>
    </div>
  );
}
