package com.example.galaxy.repositories;

import com.example.galaxy.Entities.Planet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanetRepo extends JpaRepository<Planet, Long>
{
}
