import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Trophy, AlertTriangle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  fetchAllPlanets, 
  fetchPriorityQueue, 
  type Mission, 
  type Planet, 
  reportMissionResult,
  deleteMission
} from "@/lib/api";
import { PlanetSphere } from "@/components/PlanetSphere";
import { MissionFeasibilityMonitor } from "@/components/MissionFeasibilityMonitor";
import { MissionExecutionOverlay } from "@/components/MissionExecutionOverlay";
import axios from "axios";

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
  const [predictionData, setPredictionData] = useState<any>(null);

  const isAdmin = user?.role === "ROLE_ADMIN";

  async function loadPageData() {
    try {
      setLoading(true);
      const [allPlanets, allMissions] = await Promise.all([
        fetchAllPlanets(),
        fetchPriorityQueue()
      ]);

      const currentPlanet = allPlanets.find(p => String(p.id) === planetId);
      
      if (currentPlanet) {
        setPlanet(currentPlanet);
        const planetMissions = allMissions.filter(m => m.planet?.id === currentPlanet.id);
        setMissions(planetMissions);

        if (planetMissions.length > 0 && user?.id) {
          try {
            const res = await axios.get(`http://localhost:8081/astronauts/${user.id}/predict-risk/${planetMissions[0].missionID}`);
            
            const rawText = String(res.data);
            const match = rawText.match(/(\d+)(?=\s*\/100|%)/) || rawText.match(/\d+/);
            const extractedScore = match ? Number(match[0]) : 75;

            setPredictionData({ 
              message: rawText, 
              planetName: currentPlanet.name,
              statusColor: rawText.includes("High") || rawText.includes("סיכון גבוה") ? 'RED' : 'GREEN',
              temperature: 22,
              windSpeed: 8,
              successRate: extractedScore,
              score: extractedScore
            });
          } catch (e) {
            console.error("AI Prediction fetch failed", e);
            setPredictionData({
              message: "שגיאה בסנכרון נתוני AI",
              planetName: currentPlanet.name,
              statusColor: 'RED',
              temperature: 22,
              windSpeed: 8,
              successRate: 0,
              score: 0
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load page data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      nav({ to: "/" });
      return;
    }
    loadPageData();
  }, [user, planetId]);

  const startMission = (m: Mission) => {
    if (isAdmin) return;
    setActive(m);
    setResult(null);
    setOverlayOpen(true);
  };

  const onComplete = async (success: boolean) => { 
    setOverlayOpen(false);
    
    if (active && planet && user) {
      const finishedId = active.missionID;
      setResult({ success, mission: active });

      try {
        await reportMissionResult({
          planetName: planet.name,
          temperature: predictionData?.temperature ?? 20, 
          windSpeed: predictionData?.windSpeed ?? 5,
          actualSuccessRate: success ? 100 : 0,
          missionId: Number(finishedId),
          astronautId: Number(user.id)
        });
        
        await deleteMission(Number(finishedId));
        setMissions(prev => prev.filter(m => m.missionID !== finishedId));
      } catch (err) {
        console.error("Report or delete failed:", err);
      }
    }
  };

  if (loading) return <LoadingView />;
  if (!planet) return <NotFoundView />;

  return (
    <main className={`mx-auto max-w-7xl px-6 py-10 transition-opacity ${overlayOpen ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
      <Link to="/planets" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Star Map
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 text-center backdrop-blur-md">
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-3xl opacity-20 bg-cyan-500 rounded-full" />
              <PlanetSphere planet={planet} size={240} />
            </div>
            <h1 className="mt-8 text-5xl font-black tracking-tight uppercase italic text-white">{planet.name}</h1>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
              Sector: {planet.id} | Distance: {planet.distanceFromEarth?.toLocaleString()} LY
            </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <MissionFeasibilityMonitor data={predictionData} />
        </motion.div>
      </div>

      <section className="mt-12">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400/60 font-bold">Operational Tasks</div>
            <h2 className="text-3xl font-bold uppercase italic tracking-tighter text-white">Available Missions</h2>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/40">
              <Lock size={12} /> Commander View
            </div>
          )}
        </div>

        {missions.length === 0 ? (
          <div className="bg-white/[0.01] rounded-2xl p-16 text-center border-dashed border-2 border-white/5">
            <p className="text-slate-500 font-mono uppercase text-xs tracking-widest opacity-50">Sector clear. No active directives.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((m) => (
              <motion.div key={m.missionID} whileHover={isAdmin ? {} : { y: -5 }} className="bg-white/[0.02] group flex flex-col rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all">
                <div className="space-y-1">
                    <div className="font-mono text-[10px] text-cyan-400/60 tracking-tighter">OP-ID: {m.missionID}</div>
                    <div className="text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors uppercase italic text-white">{m.missionDescription}</div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Metric label="Priority" value={m.priority} />
                  <Metric label="Difficulty" value={m.difficultyLevel} />
                </div>

                <button
                  onClick={() => startMission(m)}
                  disabled={isAdmin}
                  className={`mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black uppercase italic transition-all ${
                    isAdmin 
                    ? "bg-white/5 text-white/20 cursor-not-allowed" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10"
                  }`}
                >
                  {isAdmin ? <><Lock size={14} /> View Only</> : <><Play className="h-4 w-4 fill-current" /> Execute Launch</>}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <MissionExecutionOverlay
        open={overlayOpen}
        durationMs={4000}
        missionTitle={active?.missionDescription ?? ""}
        onComplete={onComplete}
      />

      {result && <ResultToast result={result} onClose={() => setResult(null)} />}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-center">
      <div className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">{label}</div>
      <div className="font-mono text-sm font-black text-white italic">{value}</div>
    </div>
  );
}

// ... שאר פונקציות ה-Loading ו-NotFound ללא שינוי
function LoadingView() { return <div className="flex h-[80vh] flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-cyan-400" /></div>; }
function NotFoundView() { return <div className="text-center text-white py-20">Sector Unreachable</div>; }
function ResultToast({ result, onClose }: any) { return null; }