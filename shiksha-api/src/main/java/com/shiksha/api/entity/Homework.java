package com.shiksha.api.entity;

import com.shiksha.api.common.enums.HomeworkStatus;
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
@Table(name = "\"Homework\"", schema = "school")
public class Homework {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "\"dueDate\"", nullable = false)
    private String dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HomeworkStatus status;

    @Column(name = "\"classId\"")
    private String classId;

    @Column(name = "\"subjectId\"", nullable = false)
    private String subjectId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"subjectId\"", insertable = false, updatable = false)
    private Subject subject;
}
