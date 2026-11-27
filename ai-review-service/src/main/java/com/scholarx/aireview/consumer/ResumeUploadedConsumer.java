package com.scholarx.aireview.consumer;

import com.scholarx.aireview.service.AiReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResumeUploadedConsumer {

    private final AiReviewService aiReviewService;

    @KafkaListener(topics = "resume.uploaded", groupId = "ai-review-group")
    public void consume(Map<String, Object> event) {
        log.info("Received resume.uploaded event for scholar: {}", event.get("scholarId"));
        aiReviewService.processResume(
                (String) event.get("scholarId"),
                (String) event.get("resumeText"),
                (String) event.get("targetRole")
        );
    }
}
