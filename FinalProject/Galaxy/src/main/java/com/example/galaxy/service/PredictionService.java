package com.example.galaxy.service;

import com.example.galaxy.DTO.climate.ClimateData;
import com.example.galaxy.Entities.MissionHistory;
import com.example.galaxy.config.WeatherClient;
import com.example.galaxy.repositories.MissionHistoryRepo;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PredictionService {

    private final WeatherClient weatherClient;
    private final MissionHistoryRepo historyRepo;

    public PredictionService(WeatherClient weatherClient, MissionHistoryRepo historyRepo) {
        this.weatherClient = weatherClient;
        this.historyRepo = historyRepo;
    }

    /**
     * מיפוי קוסמי לעיר אמיתית כדי לקבל מ-OpenWeather נתונים אמיתיים ומשתנים
     */
    private String mapPlanetToRealCity(String planetName) {
        String name = planetName.toLowerCase().trim();

        if (name.contains("earth")) {
            return "Bnei Brak";   // מחזיר את מזג האוויר האמיתי בארץ (22 מעלות כמו בגוגל!)
        } else if (name.contains("mars")) {
            return "Yakutsk";     // סיביר הקפואה - מייצג את מאדים
        } else if (name.contains("venus")) {
            return "Kuwait City"; // אחת הערים החמות בעולם - מייצג את נוגה
        } else if (name.contains("jupiter")) {
            return "Oymyakon";    // קור קיצוני עם רוחות חזקות - מייצג את צדק
        } else if (name.contains("mercury")) {
            return "Timbuktu";    // עיר מדברית לוהטת ויבשה
        }

        return "London"; // ברירת מחדל לכוכבים אחרים
    }

    public int getPredictionForPlanet(String planetName) {
        String realCity = mapPlanetToRealCity(planetName);
        ClimateData data = weatherClient.fetchExternalWeather(realCity);

        if (data == null) return -1;

        // חישוב הציון הבסיסי לפי הנתונים האמיתיים מהאינטרנט
        int baseScore = calculateBaseScore(data);

        // שיפור הציון באמצעות "למידה" מההיסטוריה
        return applyLearning(planetName, baseScore);
    }

    /**
     * מאפשר ל-Controller למשוך את הנתונים האמיתיים והמדויקים של העיר הממופה
     */
    public ClimateData getRealClimateForPlanet(String planetName) {
        String realCity = mapPlanetToRealCity(planetName);
        return weatherClient.fetchExternalWeather(realCity);
    }

    private int applyLearning(String planetName, int baseScore) {
        List<MissionHistory> history = historyRepo.findAll();

        if (history.isEmpty()) return baseScore;

        double avgSuccess = history.stream()
                .filter(h -> h.getPlanetName().equalsIgnoreCase(planetName.trim()))
                .mapToInt(MissionHistory::getActualSuccessRate)
                .average()
                .orElse(baseScore);

        return (int) (baseScore * 0.7 + avgSuccess * 0.3);
    }

    private int calculateBaseScore(ClimateData data) {
        int score = 100;
        if (data.getTemperature() < 0 || data.getTemperature() > 45) score -= 30;
        if (data.getWindSpeed() > 25) score -= 40;
        return Math.max(score, 0);
    }

    public void saveMissionReport(MissionHistory report) {
        historyRepo.save(report);
    }
}