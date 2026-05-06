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
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: username.trim(),
        password: password.trim()
      });
  
      const data = response.data; // הנתונים מה-LoginResponseDTO
      console.log("Server Raw Data:", data); // בדיקה קריטית בקונסול!
  
      const jwtToken = data.token;
  
      const userData: Astronaut = {
        // חילוץ ישיר מה-DTO המעודכן ששלחת ב-Java
        id: Number(data.id), 
        name: username,
        role: data.role || "ROLE_USER",
        healthScore: 100,
        trainingHours: 0,
        status: "AVAILABLE",
        survivalPrediction: 0
      };
  
      // בדיקה: אם כאן ה-ID עדיין 0, סימן שה-JSON מהשרת לא כולל את השדה "id"
      if (userData.id === 0) {
         console.error("The server returned ID 0. Response body:", data);
      }
  
      setUser(userData);
      setToken(jwtToken);
      
      // שמירה מסודרת
      localStorage.setItem(STORAGE, JSON.stringify({ user: userData, token: jwtToken }));
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: "התחברות נכשלה" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}