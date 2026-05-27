import { motion } from "framer-motion";

export function StarField({ density = 80 }: { density?: number }) {
  const stars = Array.from({ length: density }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.4,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[oklch(0.4_0.2_280/0.25)] blur-[120px]" />
      <div className="absolute -right-40 bottom-0 h-[600px] w-[600px] rounded-full bg-[oklch(0.45_0.2_320/0.2)] blur-[140px]" />
    </div>
  );
}
