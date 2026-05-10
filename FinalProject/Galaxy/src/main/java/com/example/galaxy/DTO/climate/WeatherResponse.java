package com.example.galaxy.DTO.climate;

import lombok.Data;

/**
 * מחלקה זו מייצגת את המבנה של התשובה שמגיעה מ-OpenWeather.
 * שמות השדות חייבים להתאים בדיוק למבנה ה-JSON של ה-API.
 */
@Data
public class WeatherResponse {

    private Main main;
    private Wind wind;
    private String name; // שם העיר שחזרה מה-API

    @Data
    public static class Main {
        private double temp;        // טמפרטורה
        private double humidity;    // לחות
        private double pressure;    // לחץ אטמוספרי
    }

    @Data
    public static class Wind {
        private double speed;       // מהירות הרוח
    }
}
