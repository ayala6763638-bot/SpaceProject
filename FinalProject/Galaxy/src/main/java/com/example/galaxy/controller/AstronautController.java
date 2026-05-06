package com.example.galaxy.controller;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.service.AstronautService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/astronauts")
@CrossOrigin(origins = "http://localhost:5173")

public class AstronautController {

    @Autowired
    private AstronautService astronautService;


    @GetMapping("/{id}")
    public Astronaut getAstronautById(@PathVariable Long id) {
        return astronautService.getAstronautById(id);
    }

    @PutMapping("/{id}")
    public Astronaut updateAstronaut(@PathVariable Long id, @RequestBody Astronaut astronaut) {
        return astronautService.updateAstronaut(id, astronaut);
    }
    @GetMapping("/{id}/predict-risk/{missionId}")
    public String getRiskPrediction(@PathVariable Long id, @PathVariable Long missionId) {
        return astronautService.predictMissionRisk(id, missionId);
    }

}