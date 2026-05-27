import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, Heart, Database, PlusCircle, Rocket, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchPriorityQueue, fetchAstronaut, fetchAllPlanets, createMission, deleteMission, type Mission, type Astronaut, type Planet } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user: authUser } = useAuth();
  const nav = useNavigate();
  
  const [queue, setQueue] = useState<Mission[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [liveUser, setLiveUser] = useState<Astronaut | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMission, setNewMission] = useState({ description: "", planetId: 1, priority: 5, difficulty: 5 });

  const prognosisScore = liveUser 
    ? Math.min(100, Math.round(((liveUser.healthScore ?? 0) * 0.6) + (Math.min(liveUser.trainingHours ?? 0, 100) * 0.4)))
    : 0;

  const loadData = async () => {
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
    } catch (error) { 
      console.error("Sync error", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (authUser && authUser.role !== "ROLE_ADMIN") {
      nav({ to: "/planets" });
      return;
    }
    loadData(); 
  }, [authUser?.id]);

  const handleAddMission = async () => {
    if (!newMission.description) return;
    try {
      await createMission({
        missionDescription: newMission.description,
        planet: { id: newMission.planetId },
        priority: newMission.priority,
        difficultyLevel: newMission.difficulty
      });
      setNewMission({ description: "", planetId: 1, priority: 5, difficulty: 5 });
      loadData(); 
    } catch (err) { console.error(err); }
  };

  const handleDeleteMission = async (id: number) => {
    if (!confirm("Are you sure you want to abort this mission?")) return;
    try {
      await deleteMission(id);
      loadData();
    } catch (err) { console.error("Delete failed", err); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-cyan-400 font-mono">LOADING COMMAND...</div>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 text-white antialiased">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-2 uppercase tracking-widest font-bold text-xs">
            <Rocket size={14} /> Command Uplink Active
          </div>
          <h1 className="text-5xl font-black italic uppercase text-white">{liveUser?.name || authUser?.name}</h1>
        </div>

        <div className="relative h-28 w-28 flex items-center justify-center bg-black/40 border border-white/10 rounded-full shadow-lg">
            <div className="text-center">
              <span className="text-3xl font-black text-cyan-400">{prognosisScore}%</span>
              <span className="block text-[8px] uppercase tracking-widest text-slate-400 mt-0.5">Prognosis</span>
            </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <StatCard icon={Heart} label="Biometric Stability" value={`${liveUser?.healthScore ?? 0}%`} tone="text-rose-400" />
        <StatCard icon={Clock} label="Flight Experience" value={`${liveUser?.trainingHours ?? 0}h`} tone="text-cyan-400" />
        <StatCard icon={Activity} label="System Status" value={liveUser?.status || "AVAILABLE"} tone="text-emerald-400" />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <section className="bg-white/[0.02] rounded-3xl p-8 border border-white/5">
            <h2 className="text-lg font-bold uppercase mb-6 flex items-center gap-2"><Database size={18} /> Operational Directives</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {queue.map((m, i) => (
                  <div key={m.missionID} className="bg-white/[0.02] flex items-center justify-between p-4 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{m.missionDescription}</h4>
                      <span className="text-[10px] text-cyan-400">Target: {m.planet?.name}</span>
                    </div>
                    <button onClick={() => handleDeleteMission(m.missionID)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <section className="bg-white/[0.02] rounded-3xl p-6 border border-white/5">
            <h3 className="font-bold uppercase text-xs text-cyan-400 mb-4"><PlusCircle size={14} className="inline mr-1"/> Deploy Mission</h3>
            <div className="space-y-4">
              <input type="text" value={newMission.description} onChange={e => setNewMission({...newMission, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-cyan-500" placeholder="Objective description..."/>
              <select value={newMission.planetId} onChange={e => setNewMission({...newMission, planetId: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs outline-none">
                {planets.map(p => <option key={p.id} value={p.id} className="bg-neutral-900">Target: {p.name}</option>)}
              </select>
              <button onClick={handleAddMission} className="w-full py-3 bg-cyan-500 text-black font-black uppercase text-xs rounded-xl hover:opacity-90 transition-all">Execute Launch</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className={`text-2xl font-black ${tone}`}>{value}</p>
      </div>
      <Icon size={20} className={tone} />
    </div>
  );
}