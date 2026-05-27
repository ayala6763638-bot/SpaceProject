package com.example.galaxy.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Entity

public class Planet {
 @Id
 private Long id;
 private String name;
 private Long distanceFromEarth;
 private String color;
 @OneToMany(mappedBy = "planet")
 @JsonIgnore
 private List<Astronaut> arrAstronaut;

 @OneToMany(mappedBy = "planet")
 @JsonIgnore
 private List<Mission> missions = new ArrayList<>();
}
