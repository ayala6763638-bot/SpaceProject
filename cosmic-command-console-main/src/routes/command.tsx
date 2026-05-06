import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/command")({
  component: CommandStub,
});

function CommandStub() {
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!user) nav({ to: "/" }); }, [user, nav]);
  if (!user) return null;
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <div className="glass rounded-3xl p-10">
        <div className="text-xs uppercase tracking-[0.25em] text-accent">Admin · Mission Director</div>
        <h1 className="mt-2 text-3xl font-bold">Command Center</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Live satellite map, orbiting astronauts intel, and global history log are scheduled for the next phase.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
