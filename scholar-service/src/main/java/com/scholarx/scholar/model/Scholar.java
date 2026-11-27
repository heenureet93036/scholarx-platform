package com.scholarx.scholar.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "scholars")
@Data
public class Scholar {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String email;
    private String targetRole;
    private LocalDate conversionDeadline;

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    private String resumeFileName;
}
