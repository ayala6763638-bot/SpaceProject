import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Radio, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  durationMs: number;
  missionTitle: string;
  onComplete: (success: boolean) => void;
}

const PHASES = [
  { label: "Syncing with Command...", icon: Radio },
  { label: "Aligning satellite uplink", icon: Satellite },
  { label: "Verifying telemetry handshake", icon: ShieldCheck },
  { label: "Executing mission protocol", icon: Radio },
];

export function MissionExecutionOverlay({ open, durationMs, missionTitle, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setPhase(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / durationMs) * 100);
      setProgress(p);
      setPhase(Math.min(PHASES.length - 1, Math.floor((p / 100) * PHASES.length)));
      if (p >= 100) {
        clearInterval(id);
        const success = Math.random() > 0.25;
        setTimeout(() => onComplete(success), 400);
      }
    }, 100);
    return () => clearInterval(id);
  }, [open, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-cosmos/85 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-strong relative w-[min(92vw,540px)] overflow-hidden rounded-2xl p-8"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          >
            <div className="absolute inset-0 ring-grid opacity-30" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gradient-aurora)] glow-primary"
                >
                  <Satellite className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-primary">Mission in progress</div>
                  <div className="text-lg font-semibold">{missionTitle}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Telemetry sync</span>
                  <span className="font-mono text-foreground">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full bg-[var(--gradient-aurora)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {PHASES.map((p, i) => {
                  const Icon = p.icon;
                  const active = i <= phase;
                  return (
                    <div key={i} className={`flex items-center gap-2 text-sm transition ${active ? "text-foreground" : "text-muted-foreground/50"}`}>
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : ""}`} />
                      <span>{p.label}</span>
                      {i === phase && progress < 100 && (
                        <motion.span
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="ml-auto text-xs text-primary"
                        >
                          ●
                        </motion.span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                ⚠ All UI controls disabled. Do not interrupt the uplink.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
