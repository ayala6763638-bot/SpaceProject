import { motion } from "framer-motion";
import type { Planet } from "@/lib/api";

export function PlanetSphere({ planet, size = 80, spin = true }: { planet: Planet, size?: number, spin?: boolean }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${planet.color}, #000)`,
          boxShadow: `0 0 ${size * 0.4}px ${planet.color}55`,
        }}
        animate={spin ? { rotate: 360 } : {}}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      {planet.ring && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            width: size * 1.7,
            height: size * 0.35,
            borderColor: `${planet.color}aa`,
            transform: "translate(-50%, -50%) rotateX(72deg)",
          }}
        />
      )}
    </div>
  );
}