package com.example.galaxy.repositories;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.Entities.Planet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AstronautRepo extends JpaRepository<Astronaut, Long> {

    boolean existsByNameAndPlanet(String name, Planet planet);

    List<Astronaut> findByNameAndPlanet(String name, Planet planet);
    Optional<Astronaut> findByName(String name);
}

