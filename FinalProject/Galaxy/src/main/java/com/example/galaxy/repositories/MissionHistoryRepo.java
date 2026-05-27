package com.example.galaxy.repositories;

import com.example.galaxy.Entities.MissionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MissionHistoryRepo extends JpaRepository<MissionHistory, Long> {
}