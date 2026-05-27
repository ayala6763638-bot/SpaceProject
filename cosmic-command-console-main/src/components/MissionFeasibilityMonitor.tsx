import { motion } from "framer-motion";
import { TrendingUp, Thermometer, Wind } from "lucide-react";

interface MonitorProps {
  data: {
    message?: string;
    planetName?: string;
    statusColor?: "RED" | "GREEN";
    temperature?: number;
    windSpeed?: number;
    successRate?: number;
    score?: number;
  } | null;
}

export function MissionFeasibilityMonitor({ data }: MonitorProps) {
  // חילוץ בטוח של אחוז ההצלחה
  const displaySuccessRate = data?.successRate ?? data?.score ?? 75;
  const isRed = data?.statusColor === "RED";

  return (
    <div className="bg-gradient-to-b from-white/[0.03] to-transparent rounded-[2rem] p-8 border border-white/5 backdrop-blur-md shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Predictive Telemetry</h3>
          <h2 className="text-2xl font-black uppercase italic text-white mt-1">
            Climate Analysis: {data?.planetName || "Analyzing Sector..."}
          </h2>
        </div>
        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
          isRed ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}>
          {isRed ? "HIGH RISK" : "OPTIMAL CONDITIONS"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* כרטיסיית אחוז הצלחה חי מהשרת */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-h-[110px]">
          <TrendingUp className="text-cyan-400 h-5 w-5 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Success Rate</span>
          <span className="font-mono text-2xl font-black text-white italic">
            {displaySuccessRate}%
          </span>
        </div>

        {/* כרטיסיית טמפרטורה חיה מה-API */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-h-[110px]">
          <Thermometer className="text-amber-400 h-5 w-5 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Temperature</span>
          <span className="font-mono text-2xl font-black text-white italic">
            {data?.temperature ?? "--"}°C
          </span>
        </div>

        {/* כרטיסיית מהירות רוח חיה מה-API */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-h-[110px]">
          <Wind className="text-blue-400 h-5 w-5 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Wind Speed</span>
          <span className="font-mono text-2xl font-black text-white italic">
            {data?.windSpeed ?? "--"}m/s
          </span>
        </div>
      </div>

      {data?.message && (
        <div className="mt-6 border-t border-white/5 pt-4">
          <p className="text-xs text-slate-400 font-medium whitespace-pre-line text-left leading-relaxed">
            {data.message}
          </p>
        </div>
      )}
    </div>
  );
}