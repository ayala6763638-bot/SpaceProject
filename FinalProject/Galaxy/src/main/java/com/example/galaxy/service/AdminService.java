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
public class AdminService {

    @Autowired
    private AstronautRepo astronautRepo;

    @Autowired
    private PlanetRepo planetRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MissionRepo missionRepo;

    public List<Astronaut> getAllAstronauts() {
        return astronautRepo.findAll();
    }

    public Astronaut getAstronautById(Long id) {
        return astronautRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Astronaut not found with id: " + id));
    }

    private void linkPlanet(Astronaut astronaut) {
        if (astronaut.getPlanet() != null && astronaut.getPlanet().getId() != null) {
            Planet p = planetRepo.findById(astronaut.getPlanet().getId())
                    .orElseThrow(() -> new RuntimeException("Planet not found"));
            astronaut.setPlanet(p);
        }
    }

    public Astronaut addAstronaut(Astronaut astronaut) {
        linkPlanet(astronaut);

        // הצפנת הסיסמה של האסטרונאוט החדש מהטופס
        if (astronaut.getPassword() != null && !astronaut.getPassword().isEmpty()) {
            astronaut.setPassword(passwordEncoder.encode(astronaut.getPassword()));
        }

        return astronautRepo.save(astronaut);
    }

    @Transactional
    public Astronaut updateAstronaut(Long id, Astronaut details) {
        Astronaut astronaut = astronautRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Astronaut not found"));

        astronaut.setName(details.getName());
        astronaut.setRole(details.getRole());
        astronaut.setAge(details.getAge());
        astronaut.setStatus(details.getStatus());

        if (details.getPlanetId() != null) {
            Planet planet = planetRepo.findById(details.getPlanetId())
                    .orElseThrow(() -> new RuntimeException("Planet not found"));
            astronaut.setPlanet(planet);
        }

        return astronautRepo.save(astronaut);
    }

    @Transactional
    public void deleteAstronaut(Long id) {
        Astronaut astronaut = getAstronautById(id);
        List<Mission> missions = missionRepo.findByAstronautId(id);

        for (Mission mission : missions) {
            mission.setAstronaut(null);
        }

        missionRepo.saveAll(missions);
        astronautRepo.delete(astronaut);
    }
}