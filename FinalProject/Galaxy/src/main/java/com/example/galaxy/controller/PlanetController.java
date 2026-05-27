package com.example.galaxy.controller;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.Entities.Planet;
import com.example.galaxy.service.PlanetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planets")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanetController {

    @Autowired
    private PlanetService planetService;
    //עובד✅
    // Endpoint כדי לבדוק אם אסטרונאוט קיים בכוכב
    @GetMapping("/{planetId}/astronauts/{astronautName}/exists")
    public boolean isAstronautInPlanet(@PathVariable String astronautName, @PathVariable Long planetId) {
        Planet planet = new Planet();
        planet.setId(planetId);
        return planetService.isAstronautInPlanet(astronautName, planet);
    }
    //עובד✅
    // Endpoint כדי להחזיר את כל האסטרונאוטים עם שם מסוים בכוכב מסוים
    @GetMapping("/{planetId}/astronauts/{astronautName}")
    public List<Astronaut> getAstronautsByNameAndPlanet(@PathVariable String astronautName, @PathVariable Long planetId) {
        Planet planet = new Planet();
        planet.setId(planetId);
        return planetService.getAstronautsByNameAndPlanet(astronautName, planet);
    }
    //עובד✅
    // Endpoint כדי לקבל את כל כוכבי הלכת
    @GetMapping("/all")
    public List<Planet> getAllPlanets() {
        return planetService.getAllPlanets();
    }
    //עובד✅
    // Endpoint להוסיף כוכב לכת חדש
    @PostMapping("/add")
    public Planet addPlanet(@RequestBody Planet planet) {
        System.out.println("Received Planet: " + planet);
        return planetService.addPlanet(planet);
    }

    //עובד✅
    // Endpoint לעדכן כוכב לכת
    @PutMapping("/{planetId}")
    public Planet updatePlanet(@PathVariable Long planetId, @RequestBody Planet planet) {
        return planetService.updatePlanet(planetId, planet);
    }

    //עובד✅
    // Endpoint למחוק כוכב לכת
    @DeleteMapping("/{planetId}")
    public void deletePlanet(@PathVariable Long planetId) {
        planetService.deletePlanet(planetId);
    }
}
