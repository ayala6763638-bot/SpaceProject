package com.example.galaxy.Entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.ArrayList;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@EqualsAndHashCode
@Entity
public class ControlStation {

    @Id
    @GeneratedValue
    private Long id;
    private String name;
    @OneToMany(mappedBy = "controlStation")
    private List<Mission> missions = new ArrayList<>();}
