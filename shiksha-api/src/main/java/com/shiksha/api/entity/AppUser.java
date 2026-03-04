package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Application user entity for JWT-based authentication.
 * This replaces the Supabase auth system with a dedicated user table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "app_user", schema = "school")
@EntityListeners(AuditingEntityListener.class)
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    @Builder.Default
    private String role = "TEACHER";

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column
    private String phone;

    @Column(name = "school_id")
    private String schoolId;

    @Column(name = "push_token")
    private String pushToken;

    @Column(name = "push_platform")
    private String pushPlatform;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
