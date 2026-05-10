package com.example.galaxy.controller;

import com.example.galaxy.DTO.Auth.LoginRequestDTO;
import com.example.galaxy.DTO.Auth.LoginResponseDTO;
import com.example.galaxy.Entities.Astronaut;
import com.example.galaxy.repositories.AstronautRepo;
import com.example.galaxy.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AstronautRepo astronautRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        // מציאת האסטרונאוט לפי השם שהגיע מהבקשה
        Optional<Astronaut> astronautOpt = astronautRepo.findByName(loginRequest.getUsername());

        if (astronautOpt.isPresent()) {
            Astronaut astronaut = astronautOpt.get();

            // אימות סיסמה
            if (passwordEncoder.matches(loginRequest.getPassword(), astronaut.getPassword())) {

                String role = astronaut.getRole();
                String username = astronaut.getName();
                Long id = astronaut.getId(); // שליפת ה-ID מה-Entity

                System.out.println("Generating token for user: " + username + " with ID: " + id);

                String token = jwtUtil.generateToken(username, role);

                // יצירת ה-Response עם ה-ID החדש שהוספנו ל-DTO
                return ResponseEntity.ok(new LoginResponseDTO(token, role, id));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: Invalid credentials");
    }
}