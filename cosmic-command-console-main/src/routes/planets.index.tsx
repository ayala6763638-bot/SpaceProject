import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { fetchAllPlanets, Planet } from "@/lib/api";
import { PlanetSphere } from "@/components/PlanetSphere";

export const Route = createFileRoute("/planets/")({
  component: StarMapPage,
  head: () => ({
    meta: [
      { title: "Interactive Star Map · NASA DSCPS" },
      { name: "description", content: "Solar system command map with data from live database." },
    ],
  }),
});

function StarMapPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      nav({ to: "/" });
      return;
    }

    // טעינת נתונים אמיתיים מה-DB
    fetchAllPlanets().then(data => {
      setPlanets(data);
      setLoading(false);
    });
  }, [user, nav]);

  if (!user || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-primary font-mono tracking-widest">
        LOADING PLANETARY DATA...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Heliocentric Survey</div>
        <h1 className="text-3xl font-bold">Interactive Star Map</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live data synchronization with central command database.</p>
      </div>

      <div className="glass relative h-[640px] w-full overflow-hidden rounded-3xl">
        <div className="absolute inset-0 ring-grid opacity-20" />
        
        {/* Sun */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-20 w-20 rounded-full"
            style={{
              background: "radial-gradient(circle, oklch(0.95 0.18 85), oklch(0.7 0.22 50) 70%)",
              boxShadow: "0 0 80px oklch(0.8 0.2 60 / 0.8), 0 0 160px oklch(0.7 0.22 50 / 0.5)",
            }}
          />
        </div>

        {/* Orbit rings */}
        {planets.map((p) => (
          <div
            key={`ring-${p.id}`}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
            style={{ width: p.orbitRadius * 2, height: p.orbitRadius * 2 }}
          />
        ))}

        {/* Planets orbiting */}
        {planets.map((p, i) => (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2"
            initial={{ rotate: i * 40 }}
            animate={{ rotate: 360 + i * 40 }}
            transition={{ duration: p.orbitDuration, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          >
            <Link
              to="/planets/$planetId" params={{ planetId: String(p.id) }}
              className="group absolute"
              style={{
                left: p.orbitRadius,
                top: 0,
                transform: `translate(-50%, -50%)`,
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: p.orbitDuration, repeat: Infinity, ease: "linear" }}
                className="flex flex-col items-center gap-1 transition group-hover:scale-125"
              >
                <PlanetSphere planet={p} size={p.size} />
                <div className="rounded-md bg-cosmos/80 px-2 py-0.5 text-[10px] font-medium opacity-0 transition group-hover:opacity-100">
                  {p.name}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
        {planets.map((p) => (
          <Link
            key={p.id} to="/planets/$planetId" params={{ planetId: String(p.id) }}
            className="glass group flex items-center gap-3 rounded-xl p-3 transition hover:border-primary/50"
          >
            <PlanetSphere planet={p} size={36} spin={false} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{p.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{p.distance}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}