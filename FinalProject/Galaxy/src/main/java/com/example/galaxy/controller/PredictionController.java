package com.example.galaxy.controller;

import com.example.galaxy.Entities.MissionHistory;
import com.example.galaxy.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/{planetName}")
    public ResponseEntity<String> getRecommendation(@PathVariable String planetName) {
        int score = predictionService.getPredictionForPlanet(planetName);

        if (score == -1) {
            return ResponseEntity.status(500).body("שגיאה במשיכת נתונים");
        }

        String message = "ניתוח מערכת AI עבור " + planetName + ":\n";
        message += "ציון כדאיות: " + score + "/100\n";
        message += (score > 75) ? "המלצה: תנאים אופטימליים למשימה." : "המלצה: רמת סיכון גבוהה, מומלץ להמתין.";
        message += "\n(החישוב מבוסס על נתוני אקלים בזמן אמת וניסיון ממשימות עבר)";

        return ResponseEntity.ok(message);
    }
    @PostMapping("/report")
    public ResponseEntity<String> reportMission(@RequestBody MissionHistory report) {
        predictionService.saveMissionReport(report);
        return ResponseEntity.ok("הדיווח נשמר. המודל ילמד מהנתונים הללו לחיזוי הבא!");
    }
}