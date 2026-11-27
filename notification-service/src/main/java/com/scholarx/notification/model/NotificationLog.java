package com.scholarx.notification.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Data
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String scholarId;
    private String scholarEmail;
    private String scholarName;
    private String targetRole;
    private int readinessScore;
    private String status;
    private LocalDateTime sentAt;
}
