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

        if (astronaut.getPassword() != null && !astronaut.getPassword().isEmpty()) {
            astronaut.setPassword(passwordEncoder.encode(astronaut.getPassword()));
        }

        return astronautRepo.save(astronaut);
    }

    @Transactional
    public Astronaut updateAstronaut(Long id, Astronaut updatedData) {
        Astronaut existingAstronaut = getAstronautById(id);

        existingAstronaut.setName(updatedData.getName());
        existingAstronaut.setAge(updatedData.getAge());
        existingAstronaut.setStatus(updatedData.getStatus());

        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            existingAstronaut.setPassword(passwordEncoder.encode(updatedData.getPassword()));
        }

        linkPlanet(updatedData);
        existingAstronaut.setPlanet(updatedData.getPlanet());

        return astronautRepo.save(existingAstronaut);
    }


    @Transactional
    public void deleteAstronaut(Long id) {
        // 1. מציאת האסטרונאוט (אם לא קיים, יזרוק שגיאה)
        Astronaut astronaut = getAstronautById(id);

        // 2. שליפת כל המשימות שמשויכות אליו
        List<Mission> missions = missionRepo.findByAstronautId(id);

        // 3. ניתוק הקשר: מעבר על כל המשימות והפיכתן ל"חופשיות" (null)
        for (Mission mission : missions) {
            mission.setAstronaut(null);
        }

        // 4. שמירת השינויים בבסיס הנתונים (העדכון הופך את ה-astronaut_id ל-null)
        missionRepo.saveAll(missions);

        // 5. עכשיו, כשהמשימות כבר לא מפנות לאסטרונאוט, ניתן למחוק אותו בבטחה
        astronautRepo.delete(astronaut);
    }
}
