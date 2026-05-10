package com.example.galaxy.Entities;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String planetName;
    private double temperature;
    private double windSpeed;
    private double humidity;

    // התוצאה הממשית: האם המשימה הצליחה? (100 = הצלחה מלאה, 0 = כישלון)
    private int actualSuccessRate;

    private LocalDateTime executionTime;
}