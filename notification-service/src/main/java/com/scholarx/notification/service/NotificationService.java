package com.scholarx.notification.service;

import com.scholarx.notification.model.NotificationLog;
import com.scholarx.notification.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${notification.manager-email:manager@scholarx.com}")
    private String managerEmail;

    public void sendGapReport(Map<String, Object> event) {
        String scholarId = (String) event.get("scholarId");
        String scholarName = (String) event.get("scholarName");
        String scholarEmail = (String) event.get("scholarEmail");
        String targetRole = (String) event.get("targetRole");
        int readinessScore = (int) event.get("readinessScore");

        @SuppressWarnings("unchecked")
        List<String> missingSkills = (List<String>) event.getOrDefault("missingSkills", List.of());

        @SuppressWarnings("unchecked")
        List<String> presentSkills = (List<String>) event.getOrDefault("presentSkills", List.of());

        sendScholarEmail(scholarEmail, scholarName, targetRole, readinessScore, missingSkills, presentSkills);
        sendManagerEmail(scholarName, targetRole, readinessScore);

        NotificationLog log_ = new NotificationLog();
        log_.setScholarId(scholarId);
        log_.setScholarEmail(scholarEmail);
        log_.setScholarName(scholarName);
        log_.setTargetRole(targetRole);
        log_.setReadinessScore(readinessScore);
        log_.setStatus("SENT");
        log_.setSentAt(LocalDateTime.now());
        logRepository.save(log_);

        log.info("Notification sent for scholar: {}", scholarId);
    }

    private void sendScholarEmail(String to, String name, String role,
                                   int score, List<String> missing, List<String> present) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(to);
        msg.setSubject("ScholarX — Your Readiness Report for " + role);
        msg.setText("""
                Hi %s,

                Your ScholarX Conversion Readiness Report is ready!

                Target Role: %s
                Readiness Score: %d%%

                ✅ Skills You Have:
                %s

                ❌ Skills You Need:
                %s

                Focus on closing these gaps before your conversion deadline.

                Best,
                ScholarX Platform
                """.formatted(name, role, score,
                String.join("\n- ", present),
                String.join("\n- ", missing)));
        try {
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send scholar email: {}", e.getMessage());
        }
    }

    private void sendManagerEmail(String scholarName, String role, int score) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(managerEmail);
        msg.setSubject("ScholarX — Readiness Update: " + scholarName);
        msg.setText("""
                Manager Alert,

                Scholar %s has completed their gap analysis.

                Target Role: %s
                Readiness Score: %d%%

                %s

                ScholarX Platform
                """.formatted(scholarName, role, score,
                score >= 80 ? "✅ Scholar is conversion-ready!" :
                        "⚠ Scholar needs more preparation before conversion."));
        try {
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send manager email: {}", e.getMessage());
        }
    }
}
