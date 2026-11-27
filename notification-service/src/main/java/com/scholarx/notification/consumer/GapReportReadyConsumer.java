package com.scholarx.notification.consumer;

import com.scholarx.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GapReportReadyConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "gap.report.ready", groupId = "notification-group")
    public void consume(Map<String, Object> event) {
        log.info("Received gap.report.ready event for scholar: {}", event.get("scholarId"));
        notificationService.sendGapReport(event);
    }
}
