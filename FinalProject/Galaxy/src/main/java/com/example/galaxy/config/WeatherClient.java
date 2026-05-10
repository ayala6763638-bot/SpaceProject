package com.example.galaxy.config;

import com.example.galaxy.DTO.climate.ClimateData;
import com.example.galaxy.DTO.climate.WeatherResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WeatherClient {

    private final RestTemplate restTemplate;
    // המפתח האישי שלך שקיבלת במייל
    private final String API_KEY = "4a8f08b2db58c28ff1c27d2ee2d4040c";

    public WeatherClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ClimateData fetchExternalWeather(String planetName) {
        // אנחנו ממפים שם של כוכב לעיר אמיתית כדי לקבל נתוני אמת
        String city = mapPlanetToCity(planetName);

        // יצירת הכתובת המלאה לבקשה
        String url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + API_KEY + "&units=metric";

        try {
            // ביצוע הקריאה וקבלת התגובה מה-API
            WeatherResponse response = restTemplate.getForObject(url, WeatherResponse.class);

            if (response != null) {
                ClimateData data = new ClimateData();
                data.setTemperature(response.getMain().getTemp());
                data.setWindSpeed(response.getWind().getSpeed());
                data.setHumidity(response.getMain().getHumidity());
                // נתונים שאין ב-API החינמי אנחנו "מייצרים" בצורה אקראית
                data.setRadiationLevel(Math.random() * 50);
                data.setSolarStorm(false);
                return data;
            }
        } catch (Exception e) {
            System.out.println("Error fetching weather: " + e.getMessage());
        }
        return null;
    }

    private String mapPlanetToCity(String planet) {
        return switch (planet.toLowerCase()) {
            case "mars" -> "London";
            case "venus" -> "Dubai";
            case "jupiter" -> "Reykjavik";
            default -> "Jerusalem";
        };
    }
}