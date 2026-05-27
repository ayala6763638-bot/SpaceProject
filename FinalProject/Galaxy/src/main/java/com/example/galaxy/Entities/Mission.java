package com.example.galaxy.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long missionID;

    private String missionDescription;

    @ManyToOne
    @JoinColumn(name = "planet_id")
    @JsonProperty("planet")
    private Planet planet;
    private Integer difficultyLevel; //
    private Integer priority;

    // בתוך Mission.java
    @ManyToOne(optional = true) // חשוב מאוד: מאפשר ל-Hibernate להבין שהקשר לא חייב להתקיים
    @JoinColumn(name = "astronaut_id", nullable = true) // מוודא שה-DB מאפשר ערך ריק
    @JsonProperty(value = "astronaut", access = JsonProperty.Access.WRITE_ONLY)
    private Astronaut astronaut;

    @ManyToOne(optional = true)
    @JoinColumn(name = "control_station_id")
    @JsonProperty(value = "controlStation", access = JsonProperty.Access.WRITE_ONLY)
    private ControlStation controlStation;
}