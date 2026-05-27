package com.example.galaxy.service;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.Entities.Planet;
import com.example.galaxy.repositories.AstronautRepo;
import com.example.galaxy.repositories.PlanetRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlanetService {

    @Autowired
    private AstronautRepo astronautRepo;
     @Autowired
    private PlanetRepo planetRepo;



    // קבלת כל כוכבי הלכת
    public List<Planet> getAllPlanets() {
        return planetRepo.findAll();
    }

    // הוספת כוכב לכת חדש
    public Planet addPlanet(Planet planet) {
        return planetRepo.save(planet);
    }

    // עדכון כוכב לכת
    public Planet updatePlanet(Long planetId, Planet planet) {
        Optional<Planet> existingPlanet = planetRepo.findById(planetId);
        if (existingPlanet.isPresent()) {
            Planet updatedPlanet = existingPlanet.get();
            updatedPlanet.setName(planet.getName());
            updatedPlanet.setDistanceFromEarth(planet.getDistanceFromEarth());
            // עדכון השדה החדש
            updatedPlanet.setColor(planet.getColor());
            return planetRepo.save(updatedPlanet);
        } else {
            throw new RuntimeException("Planet not found with ID: " + planetId);
        }
    }

    // מחיקת כוכב לכת
    public void deletePlanet(Long planetId) {
        planetRepo.deleteById(planetId);
    }

    public boolean isAstronautInPlanet(String astronautName, Planet planet) {
        return astronautRepo.existsByNameAndPlanet(astronautName, planet);
    }

    public List<Astronaut> getAstronautsByNameAndPlanet(String astronautName, Planet planet) {
        return astronautRepo.findByNameAndPlanet(astronautName, planet);
    }

}
