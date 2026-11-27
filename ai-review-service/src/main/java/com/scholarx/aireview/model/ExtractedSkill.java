package com.scholarx.aireview.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "extracted_skills")
@Data
public class ExtractedSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String scholarId;
    private String skillName;
    private String source;
    private String level;
    private LocalDateTime extractedAt;
}
