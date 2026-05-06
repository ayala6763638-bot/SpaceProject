import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Rocket, LogOut, Globe, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;
  const linkCls = (active: boolean) =>
    `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
      active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 glass-strong">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gradient-aurora)] glow-primary">
            <Rocket className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">NASA DSCPS</div>
            <div className="text-sm font-semibold">Deep Space Command</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/dashboard" className={linkCls(path === "/dashboard")}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link to="/planets" className={linkCls(path.startsWith("/planets"))}>
            <Globe className="h-4 w-4" /> Star Map
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="text-xs text-muted-foreground">Operator</div>
            <div className="text-sm font-medium">{user.name}</div>
          </div>
          <button
            onClick={() => { logout(); nav({ to: "/" }); }}
            className="flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-destructive/60 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        </div>
      </div>
    </header>
  );
}
