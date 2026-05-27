import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { fetchAllPlanets, type Planet } from "@/lib/api";
import { PlanetSphere } from "@/components/PlanetSphere";
import { Globe, ZoomIn, Lock, CheckCircle2, MapPin } from "lucide-react";
import * as React from "react"; 

export const Route = createFileRoute("/planets/")({
  component: StarMapPage,
});

function StarMapPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);

  const userPlanetId = user?.planetId;
  const isAdmin = user?.role === "ROLE_ADMIN";

  useEffect(() => {
    if (!user) {
      nav({ to: "/" });
      return;
    }

    async function loadPlanets() {
      try {
        const data = await fetchAllPlanets();
        setPlanets(data);
      } catch (err) {
        console.error("Failed to sync star map", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlanets();
  }, [user, nav]);

  if (loading) return <LoadingScreen />;

  const myPlanet = planets.find(p => Number(p.id) === Number(userPlanetId));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-white font-sans">
      <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Globe size={16} className="animate-spin-slow" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black">Astrometric Overlay</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Star Map</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
            {isAdmin ? "Full System Access" : "Operational Sector Access Only"}
          </p>
        </motion.div>

        {!isAdmin && (
          <div className="glass px-4 py-2 rounded-xl border-primary/20 flex items-center gap-3">
             <div className="text-right">
                <div className="text-[8px] text-white/30 uppercase font-bold">Current Base</div>
                <div className="text-xs font-black text-primary uppercase italic">
                   {myPlanet?.name || "Locating..."}
                </div>
             </div>
             <CheckCircle2 size={18} className="text-primary" />
          </div>
        )}
      </header>

      {/* Map Container */}
      <div className="glass relative h-[650px] w-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/20 flex items-center justify-center">
        
        {!isAdmin && myPlanet && (
            <div className="absolute top-8 left-8 z-50 flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full backdrop-blur-md">
                <MapPin size={14} className="text-primary animate-bounce" />
                <span className="text-[11px] font-black uppercase italic text-primary tracking-widest">
                  Target Locked: {myPlanet.name}
                </span>
            </div>
        )}

        <motion.div 
            className="relative flex items-center justify-center w-full h-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
        >
            {/* Sun */}
            <div className="relative z-10">
              <div className="h-20 w-20 rounded-full bg-yellow-500 blur-[40px] opacity-20 animate-pulse absolute -inset-2" />
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-600 to-yellow-200 shadow-[0_0_60px_rgba(255,165,0,0.5)]" />
            </div>

            {planets.map((p, i) => {
              const orbitRadius = 140 + (i * 60); 
              const isMyPlanet = Number(p.id) === Number(userPlanetId);
              const isLocked = !isAdmin && !isMyPlanet;

              return (
                <React.Fragment key={p.id}>
                  <div
                    className={`absolute rounded-full border ${isMyPlanet ? 'border-primary/40 border-dashed border-2 z-20' : 'border-white/10'}`}
                    style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                  />

                  <motion.div
                    className="absolute"
                    initial={{ rotate: i * 80 }}
                    animate={{ rotate: i * 80 + 360 }}
                    transition={{ duration: 45 + i * 15, repeat: Infinity, ease: "linear" }}
                    style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                  >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                      {isLocked ? (
                        /* כוכב חסום - צבע מלא, פשוט בלי לינק ובלי אפקטים של הובר */
                        <div className="relative opacity-60 cursor-not-allowed group">
                           <PlanetSphere planet={p} size={24} spin={true} />
                           <div className="absolute -inset-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Lock size={12} className="text-white bg-black/60 rounded-full p-0.5" />
                           </div>
                        </div>
                      ) : (
                        <Link to="/planets/$planetId" params={{ planetId: String(p.id) }} className="relative group block">
                          
                          {isMyPlanet && (
                            <motion.div 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center z-50"
                            >
                                <span className="bg-primary text-black text-[10px] font-black px-3 py-1 rounded shadow-[0_0_20px_rgba(0,255,255,0.6)] whitespace-nowrap uppercase italic mb-1 border border-white/20">
                                    I Am Here
                                </span>
                                <div className="w-px h-6 bg-gradient-to-b from-primary to-transparent" />
                            </motion.div>
                          )}

                          {isMyPlanet && (
                            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse scale-150" />
                          )}

                          <div className={`transition-all duration-500 ${isMyPlanet ? 'scale-[1.7] brightness-125 saturate-150' : 'group-hover:scale-110'}`}>
                            <PlanetSphere planet={p} size={isMyPlanet ? 38 : 28} />
                          </div>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
        </motion.div>
      </div>

      {/* Grid Bottom */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {planets.map(p => {
            const isMyPlanet = Number(p.id) === Number(userPlanetId);
            const isLocked = !isAdmin && !isMyPlanet;
            return (
                <div key={p.id} className={`glass p-4 rounded-2xl border transition-all relative overflow-hidden ${isMyPlanet ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-white/5'} ${isLocked ? 'opacity-50' : 'hover:bg-white/10'}`}>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                             {/* הנקודה הצבעונית ליד השם */}
                             <div className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }} />
                             <span className={`text-[11px] font-black uppercase tracking-tight ${isMyPlanet ? 'text-primary' : 'text-white/80'}`}>{p.name}</span>
                        </div>
                        {isLocked ? <Lock size={12} className="text-white/30" /> : (isMyPlanet ? <CheckCircle2 size={16} className="text-primary"/> : <ZoomIn size={16} className="text-white/60"/>)}
                    </div>
                    {!isLocked && <Link to="/planets/$planetId" params={{ planetId: String(p.id) }} className="absolute inset-0 z-20" />}
                </div>
            )
        })}
      </div>
    </main>
  );
}

function LoadingScreen() {
    return <div className="h-screen flex items-center justify-center bg-black text-primary font-black italic uppercase tracking-[0.5em]">Initializing Visual Uplink...</div>;
}