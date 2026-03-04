package com.shiksha.api.entity;

import com.shiksha.api.common.enums.NotificationType;
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
@Table(name = "\"Notification\"", schema = "school")
public class Notification {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "\"isRead\"")
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "\"studentId\"")
    private String studentId;

    @Column(name = "\"classId\"")
    private String classId;

    @Column(name = "\"createdAt\"")
    private String createdAt;

    @Column(name = "\"updatedAt\"")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"studentId\"", insertable = false, updatable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
