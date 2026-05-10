package com.example.galaxy.service;

import com.example.galaxy.DTO.climate.ClimateData;
import com.example.galaxy.Entities.MissionHistory;
import com.example.galaxy.Entities.StatusAstronaut;
import com.example.galaxy.config.WeatherClient;
import com.example.galaxy.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PredictionService {

    private final WeatherClient weatherClient;
    private final MissionHistoryRepo historyRepo;

    @Autowired private MissionRepo missionRepo;
    @Autowired private AstronautRepo astronautRepo;

    public PredictionService(WeatherClient weatherClient, MissionHistoryRepo historyRepo) {
        this.weatherClient = weatherClient;
        this.historyRepo = historyRepo;
    }

    @Transactional
    public void saveMissionReport(MissionHistory report, Long missionId, Long astronautId) {
        historyRepo.save(report);
        if (missionId != null) missionRepo.deleteById(missionId);
        if (astronautId != null) {
            astronautRepo.findById(astronautId).ifPresent(a -> {
                a.setStatus(StatusAstronaut.AVAILABLE);
                astronautRepo.save(a);
            });
        }
    }

    public int getPredictionForPlanet(String planetName) {
        ClimateData data = weatherClient.fetchExternalWeather(planetName);
        if (data == null) return -1;
        int base = calculateBaseScore(data);
        return applyLearning(planetName, base);
    }

    private int applyLearning(String planetName, int baseScore) {
        List<MissionHistory> history = historyRepo.findAll();
        if (history.isEmpty()) return baseScore;
        double avg = history.stream()
                .filter(h -> h.getPlanetName().equalsIgnoreCase(planetName))
                .mapToInt(MissionHistory::getActualSuccessRate)
                .average().orElse(baseScore);
        return (int) (baseScore * 0.7 + avg * 0.3);
    }

    private int calculateBaseScore(ClimateData data) {
        int score = 100;
        if (data.getTemperature() < 0 || data.getTemperature() > 45) score -= 30;
        if (data.getWindSpeed() > 25) score -= 40;
        return Math.max(score, 0);
    }
}