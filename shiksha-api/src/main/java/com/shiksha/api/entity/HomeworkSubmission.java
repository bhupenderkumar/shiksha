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
@Table(name = "\"HomeworkSubmission\"", schema = "school")
public class HomeworkSubmission {

    @Id
    private String id;

    @Column(name = "\"homeworkId\"", nullable = false)
    private String homeworkId;

    @Column(name = "\"studentId\"", nullable = false)
    private String studentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HomeworkStatus status;

    @Column(name = "\"submittedAt\"", nullable = false)
    private String submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"homeworkId\"", insertable = false, updatable = false)
    private Homework homework;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"studentId\"", insertable = false, updatable = false)
    private Student student;
}
