package com.scholarx.gap.consumer;

import com.scholarx.gap.service.GapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SkillsExtractedConsumer {

    private final GapService gapService;

    @KafkaListener(topics = "skills.extracted", groupId = "gap-group")
    public void consume(Map<String, Object> event) {
        log.info("Received skills.extracted event for scholar: {}", event.get("scholarId"));
        gapService.computeGap(
                (String) event.get("scholarId"),
                (String) event.get("targetRole"),
                (List<String>) event.getOrDefault("skills", List.of())
        );
    }
}
