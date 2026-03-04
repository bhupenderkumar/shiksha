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
@Table(name = "\"ParentSubmittedFeedback\"", schema = "school")
public class ParentSubmittedFeedback {

    @Id
    private String id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(nullable = false)
    private String month;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_relation", nullable = false)
    private String parentRelation;

    @Column(name = "parent_phone")
    private String parentPhone;

    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "progress_feedback", nullable = false)
    private String progressFeedback;

    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private String feedback = "";

    @Column(name = "home_activities")
    private String homeActivities;

    @Column(name = "improvement_areas")
    private String improvementAreas;

    @Column(name = "questions_concerns")
    private String questionsConcerns;

    @Column
    @Builder.Default
    private String status = "pending";

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
