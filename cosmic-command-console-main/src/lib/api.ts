import axios from 'axios';

const API_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: API_URL,
});

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
}, (error) => {
  return Promise.reject(error);
});

// --- Interfaces מעודכנים לפי הסרטון ---

export type StatusColor = "GREEN" | "YELLOW" | "RED";

export interface Astronaut {
  id: number;
  name: string;
  role: "ROLE_USER" | "ROLE_ADMIN";
  healthScore: number;
  trainingHours: number;
  status: "AVAILABLE" | "BUSY";
  survivalPrediction: number;
  currentPlanetId?: number;
}

export interface Planet {
  id: number;
  name: string;
  color: string;
  ring?: boolean;
  distanceFromStart?: number; // תואם ל-JSON בסרטון
  distance?: string;
  orbitRadius?: number;
  orbitDuration?: number;
  size?: number;
}

export interface Mission {
  id: number;
  missionName: string;        // שונה מ-title כדי להתאים ל-API
  missionDescription: string; // הוסף לפי ה-JSON
  priority: number;           // שונה מ-urgency
  difficultyLevel: number;    // שונה מ-difficulty
  planetId: number;
  planet?: Planet;            // אובייקט מקונן כפי שרואים ב-Network Tab
  durationSec?: number;
  reward?: number;
}

export interface PredictionDTO {
  planetName: string;
  riskScore: number;
  successProbability: number;
  temperature: number;
  windSpeed: number;
  statusColor: StatusColor;
  message: string;
}

// --- פונקציות API ---

export async function fetchAllPlanets(): Promise<Planet[]> {
  try {
    const response = await api.get<any[]>('/planets/all');
    return response.data.map(dbPlanet => ({
      ...dbPlanet,
      distance: dbPlanet.distanceFromStart ? `${dbPlanet.distanceFromStart}M km` : "Unknown",
    }));
  } catch (error) {
    console.error("Could not fetch planets:", error);
    throw error;
  }
}

export async function fetchPriorityQueue(): Promise<Mission[]> {
  // שליפת המשימות - ה-API מחזיר אובייקטים עם missionName ו-planet מקונן
  const response = await api.get<Mission[]>('/missions/all');
  return response.data;
}

export async function fetchAstronaut(id: number): Promise<Astronaut> {
  const response = await api.get<Astronaut>(`/astronauts/${id}`); 
  return response.data;
}

export async function fetchPrediction(planetName: string): Promise<PredictionDTO> {
  const response = await api.get<PredictionDTO>(`/api/prediction/predict`, { params: { planetName } });
  return response.data;
}

/**
 * פונקציה חדשה להוספת משימה כפי שנתבקש בסרטון
 */
export async function createMission(missionData: Partial<Mission>): Promise<Mission> {
  const response = await api.post<Mission>('/missions/add', missionData);
  return response.data;
}
