import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Shield, Satellite, KeyRound, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Astronaut Login · NASA DSCPS" },
      { name: "description", content: "Authenticate with your username and password to access deep space command." },
    ],
  }),
});

function LoginPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  // שינוי שמות המשתנים כדי שיהיו ברורים יותר
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: user.role === "ROLE_ADMIN" ? "/command" : "/dashboard" });
  }, [user, nav]);

  // עדכון פונקציית ה-submit להיות אסינכרונית
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // קריאה לפונקציית ה-login המעודכנת עם await
      const r = await login(username, password);
      
      if (!r.ok) { 
        setError(r.error ?? "ההתחברות נכשלה"); 
        setLoading(false); 
      }
    } catch (err) {
      setError("שגיאת תקשורת עם השרת");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 ring-grid opacity-20" />
      <div className="relative grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary">
            <Satellite className="h-3 w-3" /> Live Telemetry
          </div>
          <h1 className="text-5xl font-bold leading-tight md:text-6xl">
            Deep Space <span className="text-gradient-aurora">Command</span><br />
            & Prediction System
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            מערכת ניהול משימות מבוססת בינה מלאכותית, חיזוי אקלים בזמן אמת וניהול צוותים בממשק פיקוד אחוד.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Pill icon={Rocket} label="9 Planetary Bodies" />
            <Pill icon={Shield} label="Risk · Success · Climate" />
            <Pill icon={Satellite} label="Real-time PredictionService" />
          </div>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-8 glow-primary"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-aurora)]">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Roster Authentication</div>
              <div className="text-xl font-semibold">כניסת אסטרונאוט</div>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="שם משתמש" icon={User}>
              <input
                value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="הכנס שם משתמש"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
            <Field label="סיסמה" icon={KeyRound}>
              <input
                type="password" // חשוב כדי להסתיר את הסיסמה בהקלדה
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמה"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
          </div>

          {error && <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">{error}</div>}

          <button
            type="submit" disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--gradient-aurora)] px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "מאמת נתונים..." : "התחברות ושיגור"}
          </button>

          <div className="mt-6 rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground text-center">
            <div className="mb-1 font-semibold text-foreground">פרטי התחברות לדוגמה:</div>
            <div>משתמש: <span className="text-primary">AstronautUser</span> | סיסמה: <span className="text-primary">1234</span></div>
          </div>
        </motion.form>
      </div>
    </main>
  );
}

// קומפוננטות עזר (ללא שינוי לוגי)
function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <label className="block text-right">
      <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex flex-row-reverse items-center gap-2 rounded-lg border border-border/60 bg-input/40 px-3 py-2.5 transition focus-within:border-primary/60 focus-within:bg-input/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}

function Pill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
      <Icon className="h-3 w-3 text-primary" /> {label}
    </div>
  );
}