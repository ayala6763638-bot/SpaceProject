import { Thermometer, Wind, TrendingUp } from "lucide-react";

// הוספת הטיפוס החסר לתיקון השגיאה
interface PredictionDTO {
  planetName: string;
  statusColor: 'GREEN' | 'RED' | 'YELLOW';
  successProbability: number;
  temperature: number;
  windSpeed: number;
  message: string;
}

export function MissionFeasibilityMonitor({ data }: { data: PredictionDTO }) {
  return (
    <div className="glass rounded-2xl p-6 border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Climate Analysis: {data.planetName}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          data.statusColor === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' : 
          data.statusColor === 'RED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {data.statusColor}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatItem icon={TrendingUp} label="Success" value={`${data.successProbability}%`} />
        <StatItem icon={Thermometer} label="Temp" value={`${data.temperature}°C`} />
        <StatItem icon={Wind} label="Wind" value={`${data.windSpeed}m/s`} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground italic">{data.message}</p>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon size={14}/> {label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}