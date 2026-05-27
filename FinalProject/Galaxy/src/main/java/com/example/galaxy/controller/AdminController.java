package com.example.galaxy.controller;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.service.AdminService;
import com.example.galaxy.service.AstronautService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminService AdminService;
    @GetMapping("/all")
    public List<Astronaut> getAllAstronauts() {
        return AdminService.getAllAstronauts();
    }

    @GetMapping("/{id}")
    public Astronaut getAstronautById(@PathVariable Long id) {
        return AdminService.getAstronautById(id);
    }

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public Astronaut addAstronaut(@RequestBody Astronaut astronaut) {
        return AdminService.addAstronaut(astronaut);
    }

    @PutMapping("/{id}")
    public Astronaut updateAstronaut(@PathVariable Long id, @RequestBody Astronaut astronaut) {
        return AdminService.updateAstronaut(id, astronaut);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAstronaut(@PathVariable Long id) {
        AdminService.deleteAstronaut(id);
    }
}
