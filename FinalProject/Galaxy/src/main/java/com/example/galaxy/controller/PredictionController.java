package com.example.galaxy.controller;

import com.example.galaxy.Entities.MissionHistory;
import com.example.galaxy.DTO.climate.ClimateData;
import com.example.galaxy.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/prediction")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/{planetName}")
    public ResponseEntity<?> getRecommendation(@PathVariable String planetName) {
        // 1. חישוב ציון ההצלחה האמיתי
        int score = predictionService.getPredictionForPlanet(planetName);

        // 2. משיכת האקלים האמיתי של העיר הממופה מהאינטרנט
        ClimateData climateData = predictionService.getRealClimateForPlanet(planetName);

        if (score == -1 || climateData == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "שגיאה במשיכת נתוני אקלים עבור " + planetName);
            return ResponseEntity.status(500).body(errorResponse);
        }

        String message = "ניתוח מערכת AI עבור " + planetName + ":\n";
        message += "ציון כדאיות: " + score + "/100\n";
        message += (score > 75) ? "המלצה: תנאים אופטימליים למשימה." : "המלצה: רמת סיכון גבוהה, מומלץ להמתין.";

        // החזרת הנתונים המדויקים והמשתנים ל-React
        Map<String, Object> response = new HashMap<>();
        response.put("planetName", planetName);
        response.put("score", score);
        response.put("successRate", score); // מונע את ה-undefined% שהיה מקודם בגלל הבדלי שמות שדות!
        response.put("temperature", Math.round(climateData.getTemperature()));
        response.put("windSpeed", Math.round(climateData.getWindSpeed()));
        response.put("message", message);
        response.put("statusColor", score > 75 ? "GREEN" : "RED");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/report")
    public ResponseEntity<String> reportMission(@RequestBody MissionReportDTO dto) {
        MissionHistory history = new MissionHistory();
        history.setPlanetName(dto.getPlanetName());
        history.setTemperature(dto.getTemperature());
        history.setWindSpeed(dto.getWindSpeed());
        history.setActualSuccessRate(dto.getActualSuccessRate());
        history.setExecutionTime(LocalDateTime.now());
        history.setHumidity(45.0);

        predictionService.saveMissionReport(history);
        return ResponseEntity.ok("הדיווח התקבל בהצלחה במערכת האנליטית!");
    }

    public static class MissionReportDTO {
        private String planetName;
        private double temperature;
        private double windSpeed;
        private int actualSuccessRate;
        private Long missionId;
        private Long astronautId;

        // Getters & Setters
        public String getPlanetName() { return planetName; }
        public void setPlanetName(String planetName) { this.planetName = planetName; }
        public double getTemperature() { return temperature; }
        public void setTemperature(double temperature) { this.temperature = temperature; }
        public double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }
        public int getActualSuccessRate() { return actualSuccessRate; }
        public void setActualSuccessRate(int actualSuccessRate) { this.actualSuccessRate = actualSuccessRate; }
        public Long getMissionId() { return missionId; }
        public void setMissionId(Long missionId) { this.missionId = missionId; }
        public Long getAstronautId() { return astronautId; }
        public void setAstronautId(Long astronautId) { this.astronautId = astronautId; }
    }
}