import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Heart, Loader2, AlertCircle, Database, PlusCircle, Gauge, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  fetchPriorityQueue, 
  fetchAstronaut, 
  fetchAllPlanets, 
  createMission, 
  type Mission, 
  type Astronaut, 
  type Planet 
} from "@/lib/api";
import axios from "axios";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user: authUser, token, logout } = useAuth();
  const nav = useNavigate();
  
  const [queue, setQueue] = useState<Mission[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [liveUser, setLiveUser] = useState<Astronaut | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // State לניהול הטופס להוספת משימה
  const [newMission, setNewMission] = useState({
    name: "",
    planetId: 1,
    priority: 5,
    difficulty: 5
  });

  // חישוב ציון פרוגנוזה מבוסס עדיפות המשימות בתור
  const prognosisScore = queue.length > 0 
    ? Math.min(100, Math.round(queue.reduce((acc, m) => acc + (Number(m.priority) || 0), 0) / queue.length * 10)) 
    : 0;

  // פונקציה לטעינת כל הנתונים מהשרת וסנכרון המצב
  const loadDashboardData = async () => {
    if (!authUser?.id) return;
    try {
      const [missions, updatedUser, updatedPlanets] = await Promise.all([
        fetchPriorityQueue(),
        fetchAstronaut(authUser.id),
        fetchAllPlanets()
      ]);
      setQueue(missions);
      setLiveUser(updatedUser);
      setPlanets(updatedPlanets);
    } catch (error: any) {
      if (error.response?.status === 403) setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    loadDashboardData();
  }, [authUser?.id, token]);

  // טיפול בהוספת משימה חדשה ושליחה ל-API
const handleAddMission = async () => {
  if (!newMission.name) return;
  
  try {
    // שליחת הנתונים במבנה שה-API מצפה לו
    await createMission({
      missionName: newMission.name,
      missionDescription: `Mission to ${planets.find(p => p.id === newMission.planetId)?.name || 'target planet'}`, 
      planetId: newMission.planetId,
      priority: newMission.priority,
      difficultyLevel: newMission.difficulty
    });
    
    // איפוס ורענון
    setNewMission({ name: "", planetId: 1, priority: 5, difficulty: 5 });
    await loadDashboardData(); // זה יוודא שהרשימה נמשכת מחדש עם ה-Planet המקושר
  } catch (err) {
    console.error("Failed to add mission", err);
  }
};

  if (!authUser) return null;
  if (authError) return <AccessDeniedView onRetry={() => { logout(); nav({ to: "/" }); }} />;
  if (loading) return <LoadingView />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 242, 0.3); border-radius: 10px; }
      `}</style>

      {/* Header & Biometrics Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[10px] uppercase tracking-[0.3em] text-primary/60 font-bold">System Operator</div>
        <h1 className="mt-1 text-5xl font-black tracking-tighter italic uppercase text-white">
          {liveUser?.name || authUser.name}
        </h1>
      </motion.div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <StatCard icon={Heart} label="Biometric Stability" value={`${liveUser?.healthScore ?? 0}%`} accent="from-emerald-500/20" tone="text-emerald-400" />
        <StatCard icon={Clock} label="Flight Experience" value={`${liveUser?.trainingHours ?? 0}h`} accent="from-blue-500/20" tone="text-blue-400" />
        <StatCard icon={Activity} label="Status" value={liveUser?.status || "AVAILABLE"} accent="from-amber-500/20" tone="text-amber-400" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* רשימת המשימות - Priority Mission Stream */}
        <div className="glass rounded-3xl p-8 lg:col-span-2 border border-white/5">
          <div className="mb-6 flex items-center gap-3 text-primary">
            <Database className="h-5 w-5" />
            <h2 className="text-xl font-bold tracking-tight uppercase">Priority Mission Stream</h2>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {queue.map((mission, index) => (
              <div key={mission.id || index} className="glass-light rounded-2xl p-4 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-white/20 font-mono text-xs w-6">{(index + 1).toString().padStart(2, '0')}</span>
                  <div>
                    {/* הצגת שם המשימה מה-API */}
                    <h4 className="font-medium text-white group-hover:text-primary transition-colors">
                      {mission.missionName || "Unnamed Mission"}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                        Target: {mission.planet?.name || "Deep Space"}
                      </span>
                      <span className="text-white/10">|</span>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mission.missionDescription || "No description provided."}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <span className="text-[9px] border border-white/10 px-2 py-1 rounded text-white/40 uppercase">DIF {mission.difficultyLevel}</span>
                   <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded border ${mission.priority > 7 ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>PRIO {mission.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* צד ימין: מדדי AI וטופס הוספת משימה */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5 text-center">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-4">AI Prognosis</h2>
            <div className="flex justify-center items-baseline gap-1">
              <span className="text-7xl font-black text-white">{prognosisScore}</span>
              <span className="text-lg text-white/20 font-bold">/100</span>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold uppercase tracking-tight text-white">Add Mission</h2>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Mission Title" 
                value={newMission.name}
                onChange={(e) => setNewMission({...newMission, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />

              <select 
                value={newMission.planetId}
                onChange={(e) => setNewMission({...newMission, planetId: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none cursor-pointer"
              >
                {planets.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>)}
              </select>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Star size={10}/> Priority (1-10)</label>
                <input 
                  type="range" min="1" max="10" 
                  value={newMission.priority}
                  onChange={(e) => setNewMission({...newMission, priority: Number(e.target.value)})}
                  className="w-full accent-primary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Gauge size={10}/> Difficulty (1-10)</label>
                <input 
                  type="range" min="1" max="10" 
                  value={newMission.difficulty}
                  onChange={(e) => setNewMission({...newMission, difficulty: Number(e.target.value)})}
                  className="w-full accent-blue-400 bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button 
                onClick={handleAddMission}
                className="w-full bg-primary text-black font-black py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all uppercase text-xs tracking-widest mt-2"
              >
                Deploy Mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// קומפוננטות עזר לתצוגת כרטיסים ומצבי טעינה
function StatCard({ icon: Icon, label, value, accent, tone }: any) {
  return (
    <div className="relative overflow-hidden glass rounded-3xl p-6 border border-white/5">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${accent} to-transparent blur-2xl opacity-50`} />
      <div className="relative flex items-center gap-4">
        <div className={`rounded-2xl bg-white/5 p-3 ${tone}`}><Icon size={24} /></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`text-2xl font-black ${tone}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Synchronizing Satellite Data...</p>
    </div>
  );
}

function AccessDeniedView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <h2 className="text-2xl font-bold uppercase italic text-white">Access Denied</h2>
      <button onClick={onRetry} className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-black">Retry Login</button>
    </div>
  );
}