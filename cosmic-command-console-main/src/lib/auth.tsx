import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { type Astronaut } from "./api";

const API_BASE_URL = 'http://localhost:8081';
const STORAGE = "nasa_dscps_auth";

interface AuthState {
  user: Astronaut | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Astronaut | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
        if (parsed.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
      }
    } catch (e) {
      console.error("Failed to parse auth storage", e);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // 1. התחברות ראשונית לקבלת טוקן ו-ID
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: username.trim(),
        password: password.trim()
      });
  
      const loginData = response.data; 
      const jwtToken = loginData.token;

      // 2. קריאה נוספת להבאת נתוני האסטרונאוט המלאים (כדי לקבל את ה-planetId)
      // אנחנו משתמשים ב-ID שחזר מה-Login
      // בתוך פונקציית ה-login ב-auth.tsx, שנה את שורת ה-GET:
const astroResponse = await axios.get(`${API_BASE_URL}/astronauts/me/${loginData.id}`, {
  headers: { Authorization: `Bearer ${jwtToken}` }
});

      const fullAstroData = astroResponse.data;
  
      const userData: Astronaut = {
        id: Number(loginData.id), 
        name: fullAstroData.name,
        role: loginData.role,
        // חילוץ ה-ID מתוך אובייקט ה-planet שהשרת מחזיר
        planetId: fullAstroData.planet ? fullAstroData.planet.id : null,
        healthScore: fullAstroData.healthScore || 100,
        trainingHours: fullAstroData.trainingHours || 0,
        status: fullAstroData.status || "AVAILABLE"
      };
  
      setUser(userData);
      setToken(jwtToken);
      
      // שמירה ב-LocalStorage (חשוב!)
      localStorage.setItem(STORAGE, JSON.stringify({ user: userData, token: jwtToken }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  
      return { ok: true };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { ok: false, error: "התחברות נכשלה - בדוק שם משתמש וסיסמה" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE);
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};