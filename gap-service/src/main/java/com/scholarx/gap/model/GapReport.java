package com.scholarx.gap.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "gap_reports")
@Data
public class GapReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String scholarId;
    private String targetRole;
    private String scholarName;
    private String scholarEmail;
    private int readinessScore;

    @Column(columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String presentSkills;

    private LocalDateTime generatedAt;
}
