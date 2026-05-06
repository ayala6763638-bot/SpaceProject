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

    public int getPredictionForPlanet(String planetName) {
        ClimateData data = weatherClient.fetchExternalWeather(planetName);
        if (data == null) return -1;

        // חישוב בסיסי לפי האלגוריתם (לוגיקה קבועה)
        int baseScore = calculateBaseScore(data);

        // שיפור הציון באמצעות "למידה" מההיסטוריה
        return applyLearning(planetName, baseScore);
    }

    private int applyLearning(String planetName, int baseScore) {
        List<MissionHistory> history = historyRepo.findAll();

        // אם אין עדיין היסטוריה, תחזיר את הציון הבסיסי
        if (history.isEmpty()) return baseScore;

        // חישוב ממוצע ההצלחה של משימות עבר על הכוכב הזה
        double avgSuccess = history.stream()
                .filter(h -> h.getPlanetName().equalsIgnoreCase(planetName))
                .mapToInt(MissionHistory::getActualSuccessRate)
                .average()
                .orElse(baseScore);

        // שקלול: 70% לוגיקה קרה, 30% ניסיון מהעבר
        return (int) (baseScore * 0.7 + avgSuccess * 0.3);
    }

    private int calculateBaseScore(ClimateData data) {
        int score = 100;
        if (data.getTemperature() < 0 || data.getTemperature() > 45) score -= 30;
        if (data.getWindSpeed() > 25) score -= 40;
        return Math.max(score, 0);
    }

    // מתודה לשמירת דיווח חדש מהשטח
    public void saveMissionReport(MissionHistory report) {
        historyRepo.save(report);
    }
}