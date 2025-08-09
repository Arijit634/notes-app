package com.project.notes_backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_activities", indexes = {
    @Index(name = "idx_activity_username", columnList = "username"),
    @Index(name = "idx_activity_timestamp", columnList = "timestamp"),
    @Index(name = "idx_activity_username_timestamp", columnList = "username, timestamp")
})
public class UserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "action", nullable = false)
    @Enumerated(EnumType.STRING)
    private ActivityType action;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // "note", "user", etc.

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "resource_title")
    private String resourceTitle;

    @Column(name = "description")
    private String description;

    @CreationTimestamp
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public enum ActivityType {
        CREATED, UPDATED, DELETED, VIEWED, FAVORITED, UNFAVORITED, SHARED, UNSHARED
    }

    // Convenience constructors
    public UserActivity(String username, ActivityType action, String resourceType, Long resourceId, String resourceTitle) {
        this.username = username;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.resourceTitle = resourceTitle;
    }

    public UserActivity(String username, ActivityType action, String resourceType, Long resourceId, String resourceTitle, String description) {
        this.username = username;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.resourceTitle = resourceTitle;
        this.description = description;
    }
}
