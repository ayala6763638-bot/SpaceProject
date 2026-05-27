import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Rocket, Loader2, Radio, UserPlus, Key, 
  Shield, Heart, Award, ChevronLeft, MapPin, X
} from "lucide-react";
import { 
  fetchAllAstronauts, 
  fetchAllPlanets, 
  updateAstronautLocation, 
  createAstronaut,
  type Astronaut, 
  type Planet 
} from "@/lib/api";

export const Route = createFileRoute("/command")({
  component: CommandCenter,
});

function CommandCenter() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployingId, setDeployingId] = useState<number | null>(null);

  const [newAstronaut, setNewAstronaut] = useState({ 
    id: "", name: "", password: "", age: 25, role: "ROLE_ASTRONAUT", 
    healthScore: 100, trainingHours: 0, planetId: 1 
  });

  const loadData = async () => {
    try {
      const [aData, pData] = await Promise.all([
          fetchAllAstronauts(), 
          fetchAllPlanets()
      ]);
      setAstronauts(aData);
      setPlanets(pData);
    } catch (err) {
      console.error("Failed to load command data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user || user.role !== "ROLE_ADMIN") {
      nav({ to: "/" });
      return;
    }
    loadData();
  }, [user, nav]);

  const handleRedeploy = async (astronautId: number, newPlanetId: number) => {
    setDeployingId(astronautId);
    try {
      const updatedAstro = await updateAstronautLocation(astronautId, newPlanetId);
      setAstronauts(prev => prev.map(a => a.id === astronautId ? updatedAstro : a));
    } catch (err) {
      alert("נכשלה העברת כוח האדם.");
    } finally {
      setTimeout(() => setDeployingId(null), 1500);
    }
  };

  const handleAddAstronaut = async () => {
    if (!newAstronaut.name || !newAstronaut.id || !newAstronaut.password) {
      alert("נא למלא את כל שדות החובה: מזהה, שם מלא וסיסמה.");
      return;
    }
    try {
      await createAstronaut({
        id: Number(newAstronaut.id),
        name: newAstronaut.name,
        password: newAstronaut.password,
        age: newAstronaut.age,
        role: newAstronaut.role,
        healthScore: newAstronaut.healthScore,
        trainingHours: newAstronaut.trainingHours,
        status: "AVAILABLE",
        planet: { id: newAstronaut.planetId }
      });
      
      setNewAstronaut({ 
        id: "", name: "", password: "", age: 25, role: "ROLE_ASTRONAUT", 
        healthScore: 100, trainingHours: 0, planetId: 1 
      });
      
      loadData();
    } catch (err) {
      alert("Registration failed. Verify ID uniqueness.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-cyan-400/60">Accessing Fleet Matrix...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 font-sans text-slate-200" dir="rtl">
      {/* כותרת עמוד עליונה */}
      <header className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] font-mono">Quantum Command Link</span>
          </div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Central Control</h1>
          <p className="text-xs text-slate-500 mt-1">ניהול, הקצאת משימות ופיקוח על מערך כוח האדם הגלקטי ברשת.</p>
        </div>
        
        <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 px-6 py-4 rounded-2xl min-w-[180px] backdrop-blur-md">
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-black font-mono mb-1">Active Personnel</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-white italic font-mono">{astronauts.length}</div>
              <span className="text-xs text-cyan-400/60 font-mono">Units</span>
            </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* חלק ימני: רשימת האסטרונאוטים */}
        <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2 align-start content-start">
          <AnimatePresence mode="popLayout">
            {astronauts.map((astro) => (
              <AstronautControlCard 
                key={astro.id} 
                astronaut={astro} 
                planets={planets}
                isDeploying={deployingId === astro.id}
                onRedeploy={handleRedeploy}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* חלק שמאלי: טופס הוספת אסטרונאוט קבוע */}
        <div className="lg:col-span-4">
          <section className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/5 rounded-3xl p-6 backdrop-blur-xl sticky top-28 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-4 mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <UserPlus size={16}/>
              </div>
              <div>
                <h3 className="font-black uppercase italic text-sm text-white">Personnel Induction</h3>
                <p className="text-[10px] text-slate-500">הנפקת מזהה ואישור גישה קוסמית לעובד חדש</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* מזהה ושם */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-1">
                  <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1 font-mono">ID</label>
                  <input 
                    type="number" 
                    placeholder="000" 
                    value={newAstronaut.id} 
                    onChange={e => setNewAstronaut({...newAstronaut, id: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all text-center font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="אנליסט אוון" 
                    value={newAstronaut.name} 
                    onChange={e => setNewAstronaut({...newAstronaut, name: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all"
                  />
                </div>
              </div>
              
              {/* סיסמה */}
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1">Security Key</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Key size={14} />
                  </span>
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    value={newAstronaut.password} 
                    onChange={e => setNewAstronaut({...newAstronaut, password: e.target.value})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-9 text-xs text-white outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all font-mono"
                  />
                </div>
              </div>
              
              {/* בריאות ושעות טיסה */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1 font-mono">Health Score</label>
                    <input type="number" min="0" max="100" value={newAstronaut.healthScore} onChange={e => setNewAstronaut({...newAstronaut, healthScore: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-center"/>
                </div>
                <div className="space-y-1">
                    <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1 font-mono">Flight Hours</label>
                    <input type="number" value={newAstronaut.trainingHours} onChange={e => setNewAstronaut({...newAstronaut, trainingHours: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-center"/>
                </div>
              </div>

              {/* תחנת בסיס ראשונית */}
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black tracking-wider text-slate-400 mr-1">Initial Station Duty</label>
                <select value={newAstronaut.planetId} onChange={e => setNewAstronaut({...newAstronaut, planetId: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none cursor-pointer focus:border-cyan-500/50 transition-all">
                  {planets.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-white">Sector Base: {p.name}</option>)}
                </select>
              </div>

              {/* כפתור אישור */}
              <button onClick={handleAddAstronaut} className="w-full py-4 bg-white text-black font-black uppercase italic text-xs rounded-xl hover:bg-cyan-400 hover:scale-[1.01] active:scale-[0.99] transition-all tracking-[0.15em] shadow-xl shadow-cyan-400/5 mt-4">
                Authorize Profile
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// קומפוננטת כרטיס אסטרונאוט משודרגת
function AstronautControlCard({ astronaut, planets, isDeploying, onRedeploy }: any) {
  const currentPlanet = planets.find((p: any) => p.id === (astronaut.planetId || astronaut.planet?.id));
  const [showSelector, setShowSelector] = useState(false);

  // חילוץ בטוח של מדדים עם ערכי ברירת מחדל אסתטיים
  const health = astronaut.healthScore ?? 100;
  const hours = astronaut.trainingHours ?? 0;
  const roleDisplay = astronaut.role === "ROLE_ADMIN" ? "Commander" : "Astronaut";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5 relative overflow-hidden rounded-2xl p-5 transition-all group hover:border-white/10 shadow-lg backdrop-blur-sm"
    >
       {/* מסך טעינה בעת שיגור קוסמי מחדש */}
       <AnimatePresence>
        {isDeploying && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
             <Rocket className="text-cyan-400 h-6 w-6 animate-bounce" />
             <span className="text-[9px] font-mono tracking-widest uppercase text-cyan-400 mt-2">Redeploying Vessel...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* חלק עליון של הכרטיס */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">
            <Shield size={14} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{astronaut.name}</h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{roleDisplay} | ID: {astronaut.id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-lg font-mono">
          <MapPin size={12} className="opacity-70" />
          <span>{currentPlanet?.name || "Deep Space"}</span>
        </div>
      </div>

      {/* סטטיסטיקות פנימיות של איש הצוות */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 mt-3 mb-4">
        {/* מדד בריאות */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400 font-mono mb-1">
            <span className="flex items-center gap-1"><Heart size={10} className="text-rose-500" /> Vitality</span>
            <span className="text-white">{health}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${health > 70 ? 'bg-emerald-500' : health > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

        {/* שעות טיסה */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-xl p-2.5 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 font-mono mb-0.5">
            <Award size={10} className="text-amber-400" /> Experience
          </div>
          <div className="font-mono text-xs font-bold text-white italic">{hours} Flight Hrs</div>
        </div>
      </div>

      {/* כפתור הפעלה / בורר מיקומים */}
      <div className="mt-4">
        {!showSelector ? (
          <button 
            onClick={() => setShowSelector(true)} 
            className="w-full bg-white/[0.03] border border-white/5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all flex items-center justify-center gap-1"
          >
            Relocate Station <ChevronLeft size={12} />
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-[8px] font-black uppercase tracking-wider text-slate-500 mr-1">Select Destination Target:</div>
            <div className="grid grid-cols-3 gap-1.5">
              {planets.map((p: any) => (
                <button 
                  key={p.id} 
                  onClick={() => { onRedeploy(astronaut.id, p.id); setShowSelector(false); }} 
                  className={`text-[9px] font-bold p-2 border rounded-lg transition-all truncate text-center ${
                    p.id === currentPlanet?.id 
                    ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400 pointer-events-none" 
                    : "border-white/5 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSelector(false)} 
              className="w-full text-[9px] font-black text-rose-400/60 hover:text-rose-400 tracking-widest mt-2 uppercase flex items-center justify-center gap-1 py-1 transition-colors"
            >
              <X size={10} /> Cancel Override
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}