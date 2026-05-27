package com.example.galaxy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * יצירת Bean של RestTemplate.
     * זה יפתור את השגיאה ב-WeatherClient שמחכה לאובייקט כזה.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}