package com.example.galaxy.controller;

import com.example.galaxy.Entities.Mission;
import com.example.galaxy.service.MissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/missions") // הוספת נתיב ברור[cite: 13]
@CrossOrigin(origins = "http://localhost:5173")
public class MissionController {

    @Autowired
    private MissionService missionService;

    // שליפת כל המשימות
    @GetMapping("/all")
    public List<Mission> getAllMissions() {
        return missionService.getAllMissions();
    }

    // שליפת משימה לפי ID
    @GetMapping("/{missionId}")
    public Mission getMissionById(@PathVariable Long missionId) {
        return missionService.getMissionById(missionId);
    }

    // הוספת משימה חדשה
    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public Mission addMission(@RequestBody Mission mission) {
        return missionService.addMission(mission);
    }

    // עדכון משימה (כולל עדיפות וקושי)
    @PutMapping("/{missionId}")
    public Mission updateMission(@PathVariable Long missionId, @RequestBody Mission mission) {
        return missionService.updateMission(missionId, mission);
    }

    // מחיקת משימה
    @DeleteMapping("/{missionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMission(@PathVariable Long missionId) {
        missionService.deleteMission(missionId);
    }

    // הפעלת אלגוריתם המיון האופטימלי עבור אסטרונאוט ספציפי
    @GetMapping("/optimize/{astronautId}")
    public List<Mission> getOptimizedSchedule(@PathVariable Long astronautId) {
        return missionService.getOptimizedMissionSchedule(astronautId);
    }
}