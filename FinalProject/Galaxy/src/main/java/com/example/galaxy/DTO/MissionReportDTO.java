
package com.example.galaxy.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MissionReportDTO {
    private String planetName;
    private double temperature;
    private double windSpeed;
    private int actualSuccessRate;
    private Long missionId;    // מתאים בדיוק ל-Frontend!
    private Long astronautId;  // מתאים בדיוק ל-Frontend!
}