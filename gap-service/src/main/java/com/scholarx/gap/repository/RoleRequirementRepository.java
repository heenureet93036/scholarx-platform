package com.scholarx.gap.repository;

import com.scholarx.gap.model.RoleRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleRequirementRepository extends JpaRepository<RoleRequirement, String> {
    List<RoleRequirement> findByRoleName(String roleName);
}
