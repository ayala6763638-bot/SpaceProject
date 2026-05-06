import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Trophy, AlertTriangle, Loader2, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchAllPlanets, fetchPriorityQueue, type Mission, type Planet } from "@/lib/api";
import { PlanetSphere } from "@/components/PlanetSphere";
import { MissionFeasibilityMonitor } from "@/components/MissionFeasibilityMonitor";
import { MissionExecutionOverlay } from "@/components/MissionExecutionOverlay";

export const Route = createFileRoute("/planets/$planetId")({
  component: PlanetPage,
});

function PlanetPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { planetId } = Route.useParams();
  
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Mission | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; mission: Mission }>(null);

  useEffect(() => {
    if (!user) {
      nav({ to: "/" });
      return;
    }

    async function loadPageData() {
      try {
        setLoading(true);
        // שליפת כל הנתונים מהשרת
        const [allPlanets, allMissions] = await Promise.all([
          fetchAllPlanets(),
          fetchPriorityQueue()
        ]);

        // מציאת הכוכב הנוכחי מתוך הרשימה המעודכנת
        const currentPlanet = allPlanets.find(p => p.id === Number(planetId));
        if (currentPlanet) {
          setPlanet(currentPlanet);
          const planetMissions = allMissions.filter(m => m.planetId === Number(planetId));
          setMissions(planetMissions);
        }
      } catch (error) {
        console.error("Failed to load page data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [user, nav, planetId]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-mono tracking-tighter text-muted-foreground">SYNCHRONIZING WITH PLANETARY DATABASE...</p>
      </div>
    );
  }

  if (!planet) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Planet not found</h1>
        <Link to="/planets" className="mt-4 inline-block text-primary hover:underline">← Back to star map</Link>
      </main>
    );
  }

  const start = (m: Mission) => {
    setActive(m);
    setResult(null);
    setOverlayOpen(true);
  };

  const onComplete = (success: boolean) => {
    setOverlayOpen(false);
    if (active) {
      setResult({ success, mission: active });
      // כאן ניתן להוסיף קריאת API לעדכון הצלחת המשימה ב-Backend
    }
  };

  return (
    <main className={`mx-auto max-w-7xl px-6 py-10 transition-opacity ${overlayOpen ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
      <Link to="/planets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Star Map
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* צד שמאל - פרטי כוכב הלכת */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 border border-white/5">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-primary rounded-full" />
              <PlanetSphere planet={planet} size={240} />
            </div>
            <h1 className="mt-8 text-5xl font-black tracking-tight">{planet.name}</h1>
            <div className="mt-2 font-mono text-xs uppercase tracking-widest text-primary/70">
              Sector Coordinates: {planet.distance}
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5 text-xs font-medium border border-white/5">
                <Target className="h-3.5 w-3.5 text-primary" />
                {missions.length} Active Operations
              </div>
              <div className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                Data Stream: Stable
              </div>
            </div>
          </div>
        </motion.div>

        {/* צד ימין - מוניטור ותחזית AI */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <MissionFeasibilityMonitor planetName={planet.name} />
        </motion.div>
      </div>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary/60 font-bold">Operational Tasks</div>
            <h2 className="text-3xl font-bold">Available Missions</h2>
          </div>
        </div>

        {missions.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center border-dashed border-2 border-white/5">
            <p className="text-muted-foreground">No active missions assigned to this sector.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((m) => (
              <motion.div 
                key={m.id} 
                whileHover={{ y: -5 }}
                className="glass group flex flex-col rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-mono text-[10px] text-primary/60 tracking-tighter">OP-ID: 00{m.id}</div>
                    <div className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{m.title}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xs font-bold text-emerald-400">+{m.reward}</div>
                    <div className="text-[9px] uppercase text-muted-foreground">Credits</div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Metric label="Diff" value={m.difficulty} />
                  <Metric label="Urg" value={m.urgency} />
                  <Metric label="Time" value={`${m.durationSec}s`} />
                </div>

                <button
                  onClick={() => start(m)}
                  className="mt-6 w-full overflow-hidden relative group/btn flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                >
                  <Play className="h-4 w-4 fill-current" /> 
                  Initiate Deploy
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* הודעת תוצאה צפה */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-2xl p-[1px] shadow-2xl`}
          style={{ background: result.success ? 'linear-gradient(to right, #10b981, #3b82f6)' : 'linear-gradient(to right, #ef4444, #f59e0b)' }}
        >
          <div className="bg-cosmos rounded-[15px] px-8 py-4 flex items-center gap-4 min-w-[320px]">
            {result.success ? (
              <Trophy className="h-8 w-8 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            )}
            <div className="flex-1">
              <div className="text-base font-bold leading-none">{result.success ? "MISSION SUCCESS" : "MISSION ABORTED"}</div>
              <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-tighter">
                Log: {result.mission.title}
              </div>
            </div>
            <button onClick={() => setResult(null)} className="hover:bg-white/10 p-1 rounded-md transition-colors">
              <span className="text-xs font-bold opacity-50 uppercase">Close</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* שכבת ביצוע המשימה */}
      <MissionExecutionOverlay
        open={overlayOpen}
        durationMs={Math.max(8000, (active?.durationSec ?? 30) * 1000)}
        missionTitle={active?.title ?? ""}
        onComplete={onComplete}
      />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 py-3 px-1 text-center">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-sm font-black text-foreground">{value}</div>
    </div>
  );
}