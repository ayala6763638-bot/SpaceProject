package com.example.galaxy.DTO.climate;

import lombok.Data;

@Data
public class ClimateData {
    private double temperature;
    private double windSpeed;
    private double radiationLevel; // רמת קרינה
    private double humidity;       // לחות
    private boolean solarStorm;    // האם יש סערה סולארית פעילה
}