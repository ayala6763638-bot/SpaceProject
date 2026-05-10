package com.example.galaxy.repositories;

import com.example.galaxy.Entities.ControlStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ControlStationRepo extends JpaRepository<ControlStation, Long> {
}