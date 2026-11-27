package com.scholarx.aireview.repository;

import com.scholarx.aireview.model.ExtractedSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExtractedSkillRepository extends JpaRepository<ExtractedSkill, String> {
    List<ExtractedSkill> findByScholarId(String scholarId);
}
