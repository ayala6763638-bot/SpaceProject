package com.example.galaxy.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Entity
public class Astronaut {
 @Id
 //@GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;
 // בתוך מחלקת Astronaut
 // במקום @JsonIgnore
 @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
 private String password;
 private String name;
 private Integer age;
 private Integer healthScore; // ציון בריאות מ-1 עד 100
 private Integer trainingHours; // שעות אימון מצטברות
 private String role;

 @Enumerated(EnumType.STRING)
 private StatusAstronaut status;

 @ManyToOne
 @JoinColumn(name = "planet_id")
 private Planet planet;

 // הוספת ה-JsonIgnore כאן היא קריטית לעצירת הלולאה האינסופית
 @OneToMany(mappedBy = "astronaut")
 @JsonIgnore
 private List<Mission> missions;
}