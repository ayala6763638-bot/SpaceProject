package com.example.galaxy.repositories;

import com.example.galaxy.Entities.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MissionRepo extends JpaRepository<Mission, Long> {

    // מתודה חיונית עבור אלגוריתם האופטימיזציה
    // היא מחפשת את כל המשימות שבהן ה-ID של האסטרונאוט תואם לפרמטר
    List<Mission> findByAstronautId(Long astronautId);
}