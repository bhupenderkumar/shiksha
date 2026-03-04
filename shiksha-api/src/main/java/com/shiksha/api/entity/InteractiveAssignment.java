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
@Table(name = "\"InteractiveAssignment\"", schema = "school")
public class InteractiveAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String type;

    @Column
    private String status;

    @Column(name = "\"classId\"")
    private String classId;

    @Column(name = "\"subjectId\"")
    private String subjectId;

    @Column(name = "\"dueDate\"")
    private String dueDate;

    @Column(name = "\"difficultyLevel\"")
    private String difficultyLevel;

    @Column(name = "\"ageGroup\"")
    private String ageGroup;

    @Column(name = "\"estimatedTimeMinutes\"")
    private Integer estimatedTimeMinutes;

    @Column(name = "\"hasCelebration\"")
    private Boolean hasCelebration;

    @Column(name = "\"hasAudioFeedback\"")
    private Boolean hasAudioFeedback;

    @Column(name = "\"requiresParentHelp\"")
    private Boolean requiresParentHelp;

    @Column(name = "\"audioInstructions\"")
    private String audioInstructions;

    @Column(name = "\"shareableLink\"")
    private String shareableLink;

    @Column(name = "\"shareableLinkExpiresAt\"")
    private String shareableLinkExpiresAt;

    @Column(name = "\"createdBy\"")
    private String createdBy;

    @Column(name = "\"createdAt\"")
    private String createdAt;

    @Column(name = "\"updatedAt\"")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"subjectId\"", insertable = false, updatable = false)
    private Subject subject;
}
