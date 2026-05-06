package com.example.galaxy.service;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.Entities.Mission;
import com.example.galaxy.Entities.Planet;
import com.example.galaxy.repositories.AstronautRepo;
import com.example.galaxy.repositories.MissionRepo;
import com.example.galaxy.repositories.PlanetRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AstronautService {

    @Autowired
    private AstronautRepo astronautRepo;
    @Autowired
    private PlanetRepo planetRepo;
    @Autowired
    private MissionRepo missionRepo; // וודאי שהוספת את ה-Repo הזה
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Astronaut getAstronautById(Long id) {
        return astronautRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Astronaut not found with id: " + id));
    }

    // אלגוריתם לחיזוי סיכון משימה - שילוב רכיב מחקרי
    public String predictMissionRisk(Long astronautId, Long missionId) {
        Astronaut astronaut = getAstronautById(astronautId);
        Mission mission = missionRepo.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        // לוגיקה אלגוריתמית פשוטה המבוססת על שקלול נתונים (Base for KNN)
        double riskFactor = (mission.getDifficultyLevel() * 10.0) /
                (astronaut.getHealthScore() * (astronaut.getTrainingHours() / 100.0));

        if (riskFactor > 1.5) {
            return "High Risk - Astronaut needs more training or rest";
        } else if (riskFactor > 0.8) {
            return "Medium Risk";
        }
        return "Low Risk";
    }

    @Transactional
    public Astronaut updateAstronaut(Long id, Astronaut updatedData) {
        Astronaut existingAstronaut = getAstronautById(id);
        existingAstronaut.setName(updatedData.getName());
        existingAstronaut.setAge(updatedData.getAge());
        existingAstronaut.setStatus(updatedData.getStatus());
        existingAstronaut.setHealthScore(updatedData.getHealthScore()); // עדכון השדה החדש
        existingAstronaut.setTrainingHours(updatedData.getTrainingHours()); // עדכון השדה החדש

        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            existingAstronaut.setPassword(passwordEncoder.encode(updatedData.getPassword()));
        }

        if (updatedData.getPlanet() != null) {
            linkPlanet(updatedData);
            existingAstronaut.setPlanet(updatedData.getPlanet());
        }

        return astronautRepo.save(existingAstronaut);
    }

    private void linkPlanet(Astronaut astronaut) {
        if (astronaut.getPlanet() != null && astronaut.getPlanet().getId() != null) {
            Planet p = planetRepo.findById(astronaut.getPlanet().getId())
                    .orElseThrow(() -> new RuntimeException("Planet not found"));
            astronaut.setPlanet(p);
        }
    }


}