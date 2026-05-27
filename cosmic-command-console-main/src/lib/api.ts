import axios from 'axios';

const API_URL = 'http://localhost:8081';

// יצירת Instance של Axios לניהול הגדרות גלובליות
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor להוספת ה-Token באופן אוטומטי לכל קריאה
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('nasa_dscps_auth'); 
  if (authData) {
    try {
      const parsedData = JSON.parse(authData);
      const token = parsedData.token; 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error parsing auth data from localStorage", e);
    }
  }
  return config;
}, (error) => Promise.reject(error));

// --- INTERFACES (מותאמים בדיוק ל-Backend) ---

export interface Planet {
  id: number;
  name: string;
  color: string;
  distanceFromEarth?: number;
  // הוסיפי את השורה הזו:
  ring?: boolean; 
  
  // שדות נוספים שצריך בשביל המפה:
  orbitRadius?: number;
  orbitDuration?: number;
  size?: number;
}


export interface Astronaut {
  id: number;
  name: string;
  role: string;
  planetId?: number | null; // השדה הזה חייב להיות כאן!
  healthScore?: number;
  trainingHours?: number;
  status?: string;
}
export interface Mission {
  missionID: number;
  missionDescription: string;
  priority: number;
  difficultyLevel: number;
  planet?: {
    id: number;
    name?: string;
  };
}

// --- פונקציות API ---

/**
 * שליפת כל כוכבי הלכת מה-Database
 */
export async function fetchAllPlanets(): Promise<Planet[]> {
  const response = await api.get<Planet[]>('/planets/all');
  return response.data.map(p => ({
    ...p,
    // הפיכת המרחק למחרוזת קריאה לצורך תצוגה
    distance: p.distanceFromEarth ? `${p.distanceFromEarth.toLocaleString()}M km` : "Unknown"
  }));
}

/**
 * שליפת תור המשימות המעודכן
 */
export async function fetchPriorityQueue(): Promise<Mission[]> {
  const response = await api.get<Mission[]>('/missions/all');
  return response.data;
}

/**
 * שליפת נתוני אסטרונאוט ספציפי (דרך AdminController)
 */
export async function fetchAstronaut(id: number): Promise<Astronaut> {
  const response = await api.get<Astronaut>(`/admin/${id}`); 
  return response.data;
}

/**
 * הוספת אסטרונאוט חדש ל-Database
 */
export async function createAstronaut(data: any): Promise<Astronaut> {
  const response = await api.post<Astronaut>('/admin/add', data);
  return response.data;
}

/**
 * יצירת משימה חדשה ושיגורה למערכת
 */
export async function createMission(data: any): Promise<Mission> {
  const response = await api.post<Mission>('/missions/add', data);
  return response.data;
}

/**
 * מחיקת משימה מהמערכת (Abort)
 */
export async function deleteMission(id: number): Promise<void> {
  await api.delete(`/missions/${id}`);
}

/**
 * חיזוי סיכונים עבור אסטרונאוט ומשימה (Predict Algorithm)
 */
export async function getRiskPrediction(astronautId: number, missionId: number): Promise<string> {
  const response = await api.get<string>(`/astronauts/${astronautId}/predict-risk/${missionId}`);
  return response.data;
}

/**
 * דיווח על תוצאת משימה לשרת לצורך למידת המודל
 */
// src/lib/api.ts
export async function reportMissionResult(data: {
  planetName: string;
  temperature: number;
  windSpeed: number;
  actualSuccessRate: number;
  missionId: number;    // הוספת השדה הזה
  astronautId: number;  // הוספת השדה הזה
}) {
  // שליחת הנתונים לשרת
  // שים לב: אם השרת מצפה ל-ID בתוך ה-Body, השאר זאת כך. 
  // אם הוא מצפה להם כפרמטרים ב-URL (Query Params), השתמש ב-params.
  const response = await api.post('/api/prediction/report', data);
  return response.data;
}

export async function fetchBestPlanet(): Promise<string> {
  const response = await api.get('/api/prediction/best');
  return response.data;
}

export async function fetchAllPlanetScores(): Promise<string> {
  const response = await api.get('/api/prediction/all-scores');
  return response.data;
}

// הוסף לקובץ @/lib/api.ts

export async function fetchAllAstronauts(): Promise<Astronaut[]> {
  const response = await api.get<Astronaut[]>('/admin/all');
  return response.data;
}

export async function updateAstronautLocation(astronautId: number, planetId: number): Promise<Astronaut> {
  // 1. נביא את האסטרונאוט הנוכחי
  const currentAstro = await api.get<Astronaut>(`/admin/${astronautId}`);
  
  const updatedData = {
    ...currentAstro.data,
    planetId: planetId, // זה יכנס ל-getPlanetId() ב-Java
    planet: { id: planetId } // ליתר ביטחון, אם ה-Service משתמש בקישור ישיר
  };

  const response = await api.put<Astronaut>(`/admin/${astronautId}`, updatedData);
  return response.data;
}

export default api;