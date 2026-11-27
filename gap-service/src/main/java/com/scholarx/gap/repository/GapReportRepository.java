package com.scholarx.gap.repository;

import com.scholarx.gap.model.GapReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GapReportRepository extends JpaRepository<GapReport, String> {
}
