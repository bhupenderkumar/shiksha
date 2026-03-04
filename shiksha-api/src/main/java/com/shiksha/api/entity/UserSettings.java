package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"UserSettings\"", schema = "school")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled;

    @Column(name = "email_notifications")
    private Boolean emailNotifications;

    @Column(name = "notifications", columnDefinition = "jsonb")
    private String notifications;

    @Column(name = "theme", columnDefinition = "jsonb")
    private String theme;

    @Column(name = "security", columnDefinition = "jsonb")
    private String security;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
