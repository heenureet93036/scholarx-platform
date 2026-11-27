package com.scholarx.scholar.repository;

import com.scholarx.scholar.model.Scholar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScholarRepository extends JpaRepository<Scholar, String> {
}
