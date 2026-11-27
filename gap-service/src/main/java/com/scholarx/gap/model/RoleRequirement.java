package com.scholarx.gap.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "role_requirements")
@Data
public class RoleRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String roleName;
    private String skillName;
    private String requiredLevel;
}
