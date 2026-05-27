package com.example.galaxy;

import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.Entities.StatusAstronaut;
import com.example.galaxy.repositories.AstronautRepo;
import com.example.galaxy.repositories.PlanetRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class GalaxyApplication {

    public static void main(String[] args) {
        SpringApplication.run(GalaxyApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(AstronautRepo astronautRepo, PlanetRepo planetRepo, PasswordEncoder passwordEncoder) {
        System.out.println("hhggggg****");
        return args -> {

            Astronaut astronaut = new Astronaut(
                    1L,
                    passwordEncoder.encode("1234"),
                    "Levi",
                    33,
                    100,
                    0,
                    "ROLE_ADMIN", // שונה מ-"admin" ל-"ROLE_ADMIN"
                    StatusAstronaut.AVAILABLE,
                    null,
                    null
            );
                System.out.println("hhggg");
                astronautRepo.save(astronaut);

        };
    }
}