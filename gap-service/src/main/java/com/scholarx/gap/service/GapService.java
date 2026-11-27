package com.scholarx.gap.service;

import com.scholarx.gap.grpc.ScholarGrpcClient;
import com.scholarx.gap.model.GapReport;
import com.scholarx.gap.model.RoleRequirement;
import com.scholarx.gap.repository.GapReportRepository;
import com.scholarx.gap.repository.RoleRequirementRepository;
import com.scholarx.grpc.ScholarResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GapService {

    private final RoleRequirementRepository roleRequirementRepository;
    private final GapReportRepository gapReportRepository;
    private final ScholarGrpcClient scholarGrpcClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void computeGap(String scholarId, String targetRole, List<String> extractedSkills) {
        log.info("Computing gap for scholar: {}, role: {}", scholarId, targetRole);

        ScholarResponse profile = scholarGrpcClient.getScholarProfile(scholarId);

        List<RoleRequirement> requirements = roleRequirementRepository.findByRoleName(targetRole);
        List<String> requiredSkills = requirements.stream()
                .map(RoleRequirement::getSkillName)
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        List<String> normalizedExtracted = extractedSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        List<String> present = normalizedExtracted.stream()
                .filter(requiredSkills::contains)
                .collect(Collectors.toList());

        List<String> missing = requiredSkills.stream()
                .filter(s -> !normalizedExtracted.contains(s))
                .collect(Collectors.toList());

        int score = requiredSkills.isEmpty() ? 0 :
                (int) ((present.size() * 100.0) / requiredSkills.size());

        GapReport report = new GapReport();
        report.setScholarId(scholarId);
        report.setTargetRole(targetRole);
        report.setScholarName(profile.getName());
        report.setScholarEmail(profile.getEmail());
        report.setReadinessScore(score);
        report.setPresentSkills(String.join(",", present));
        report.setMissingSkills(String.join(",", missing));
        report.setGeneratedAt(LocalDateTime.now());
        gapReportRepository.save(report);

        log.info("Gap report saved. Readiness: {}%", score);

        kafkaTemplate.send("gap.report.ready", Map.of(
                "scholarId", scholarId,
                "scholarName", profile.getName(),
                "scholarEmail", profile.getEmail(),
                "targetRole", targetRole,
                "readinessScore", score,
                "missingSkills", missing,
                "presentSkills", present
        ));
    }
}
