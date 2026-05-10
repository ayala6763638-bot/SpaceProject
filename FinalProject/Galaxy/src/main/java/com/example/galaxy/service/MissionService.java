package com.example.galaxy.service;

import com.example.galaxy.Entities.*;
import com.example.galaxy.repositories.*;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

@Service
public class MissionService {

    @Autowired
    private MissionRepo missionRepo;
    @Autowired
    private PlanetRepo planetRepo;
    @Autowired
    private AstronautRepo astronautRepo;
    @Autowired
    private ControlStationRepo controlStationRepo;
    @Autowired
    private EntityManager entityManager;

    public List<Mission> getAllMissions() {
        return missionRepo.findAll();
    }

    public Mission getMissionById(Long missionId) {
        return missionRepo.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));
    }

    @Transactional
    public Mission updateMission(Long missionId, Mission updatedData) {
        // 1. שליפת המשימה הקיימת
        Mission existingMission = missionRepo.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found with id: " + missionId));

        // 2. עדכון שדות בסיסיים ושדות האלגוריתם
        existingMission.setMissionDescription(updatedData.getMissionDescription());
        existingMission.setDifficultyLevel(updatedData.getDifficultyLevel()); // שדה חדש לאלגוריתם
        existingMission.setPriority(updatedData.getPriority());               // שדה חדש לאלגוריתם

        // 3. עדכון קשרים (Planet, Astronaut, ControlStation)
        if (updatedData.getPlanet() != null && updatedData.getPlanet().getId() != null) {
            Planet p = planetRepo.findById(updatedData.getPlanet().getId())
                    .orElseThrow(() -> new RuntimeException("Planet not found"));
            existingMission.setPlanet(p);
        }

        if (updatedData.getAstronaut() != null && updatedData.getAstronaut().getId() != null) {
            Astronaut a = astronautRepo.findById(updatedData.getAstronaut().getId())
                    .orElseThrow(() -> new RuntimeException("Astronaut not found"));
            existingMission.setAstronaut(a);
        }

        if (updatedData.getControlStation() != null && updatedData.getControlStation().getId() != null) {
            ControlStation cs = controlStationRepo.findById(updatedData.getControlStation().getId())
                    .orElseThrow(() -> new RuntimeException("Control Station not found"));
            existingMission.setControlStation(cs);
        }

        return missionRepo.save(existingMission);
    }

    public Mission addMission(Mission mission) {
        linkDependencies(mission);
        return missionRepo.save(mission);
    }

    private void linkDependencies(Mission mission) {
        if (mission.getPlanet() != null && mission.getPlanet().getId() != null) {
            mission.setPlanet(planetRepo.findById(mission.getPlanet().getId()).orElse(null));
        }
        if (mission.getAstronaut() != null && mission.getAstronaut().getId() != null) {
            mission.setAstronaut(astronautRepo.findById(mission.getAstronaut().getId()).orElse(null));
        }
        if (mission.getControlStation() != null && mission.getControlStation().getId() != null) {
            mission.setControlStation(controlStationRepo.findById(mission.getControlStation().getId()).orElse(null));
        }
    }

    public List<Mission> getOptimizedMissionSchedule(Long astronautId) {
        List<Mission> allMissions = missionRepo.findByAstronautId(astronautId);

        if (allMissions == null || allMissions.isEmpty()) {
            return new ArrayList<>();
        }

        // אלגוריתם מיון משוקלל: עדיפות (Priority) ורמת קושי (Difficulty)
        PriorityQueue<Mission> scheduleQueue = new PriorityQueue<>((m1, m2) -> {
            int p1 = (m1.getPriority() != null) ? m1.getPriority() : 0;
            int p2 = (m2.getPriority() != null) ? m2.getPriority() : 0;
            int d1 = (m1.getDifficultyLevel() != null) ? m1.getDifficultyLevel() : 0;
            int d2 = (m2.getDifficultyLevel() != null) ? m2.getDifficultyLevel() : 0;

            // חישוב ציון משולב (עדיפות מקבלת משקל גבוה יותר)
            double score1 = (p1 * 2.0) + d1;
            double score2 = (p2 * 2.0) + d2;

            return Double.compare(score2, score1); // מיון מהציון הגבוה לנמוך
        });

        scheduleQueue.addAll(allMissions);

        List<Mission> sortedList = new ArrayList<>();
        while (!scheduleQueue.isEmpty()) {
            sortedList.add(scheduleQueue.poll());
        }
        return sortedList;
    }

    public void deleteMission(Long missionId) {
        missionRepo.deleteById(missionId);
    }
}