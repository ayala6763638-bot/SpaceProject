package com.example.galaxy.controller;

import com.example.galaxy.DTO.climate.ClimateData;
import com.example.galaxy.Entities.MissionHistory;
import com.example.galaxy.service.PredictionService;
import com.example.galaxy.config.WeatherClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/prediction")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;
    private final WeatherClient weatherClient; // הוספת ה-Client כדי לשלוף נתוני אקלים גולמיים

    public PredictionController(PredictionService predictionService, WeatherClient weatherClient) {
        this.predictionService = predictionService;
        this.weatherClient = weatherClient;
    }

    /**
     * Endpoint המשרת את המוניטור בעמוד הכוכב.
     * מחזיר אובייקט JSON מובנה כדי למנוע שגיאות undefined ב-Frontend.
     */
    @GetMapping("/predict")
    public ResponseEntity<?> getPredictionData(@RequestParam String planetName) {
        int score = predictionService.getPredictionForPlanet(planetName);
        ClimateData climate = weatherClient.fetchExternalWeather(planetName);

        if (score == -1 || climate == null) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch telemetry data"));
        }

        // החזרת אובייקט שתואם בדיוק ל-PredictionDTO ב-React
        return ResponseEntity.ok(Map.of(
                "planetName", planetName,
                "statusColor", (score > 75) ? "GREEN" : (score > 50) ? "YELLOW" : "RED",
                "successProbability", score,
                "temperature", climate.getTemperature(),
                "windSpeed", climate.getWindSpeed(),
                "message", (score > 75) ? "תנאים אופטימליים למשימה." : "רמת סיכון גבוהה, מומלץ להמתין."
        ));
    }

    /**
     * דיווח על סיום משימה.
     * הנתיב מוחרג ב-SecurityConfig כדי למנוע שגיאת 403.
     */
    @PostMapping("/report")
    public ResponseEntity<String> reportMission(
            @RequestBody MissionHistory report,
            @RequestParam(required = false) Long missionId,
            @RequestParam(required = false) Long astronautId) {

        // קריאה לשירות ששומר היסטוריה, מוחק משימה ומשחרר אסטרונאוט
        predictionService.saveMissionReport(report, missionId, astronautId);
        return ResponseEntity.ok("Mission history updated and system synchronized.");
    }

    /**
     * מחזיר את הכוכב עם סיכויי ההצלחה הגבוהים ביותר.
     */
    @GetMapping("/best")
    public ResponseEntity<String> getBestPlanet() {
        String[] planets = {"Mars", "Venus", "Jupiter", "Neptune", "Earth"};
        String bestPlanet = "";
        int topScore = -1;

        for (String p : planets) {
            int score = predictionService.getPredictionForPlanet(p);
            if (score > topScore) {
                topScore = score;
                bestPlanet = p;
            }
        }
        return ResponseEntity.ok("הכוכב המומלץ ביותר לשיגור כרגע הוא **" + bestPlanet + "** עם ציון כדאיות של " + topScore + "/100.");
    }

    /**
     * מחזיר ריכוז ציונים לכל הכוכבים עבור הבוט.
     */
    @GetMapping("/all-scores")
    public ResponseEntity<String> getAllScores() {
        String[] planets = {"Mars", "Venus", "Jupiter", "Neptune", "Earth"};
        StringBuilder sb = new StringBuilder("ריכוז ציוני חיזוי לכל המגזרים:\n\n");

        for (String p : planets) {
            int score = predictionService.getPredictionForPlanet(p);
            sb.append("🪐 **").append(p).append("**: ").append(score).append("/100\n");
        }
        return ResponseEntity.ok(sb.toString());
    }
}