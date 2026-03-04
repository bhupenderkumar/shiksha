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
@Table(name = "\"File\"", schema = "school")
public class FileEntity {

    @Id
    private String id;

    @Column(name = "\"fileName\"", nullable = false)
    private String fileName;

    @Column(name = "\"filePath\"", nullable = false)
    private String filePath;

    @Column(name = "\"fileType\"", nullable = false)
    private String fileType;

    @Column(name = "\"uploadedBy\"", nullable = false)
    private String uploadedBy;

    @Column(name = "\"uploadedAt\"", nullable = false)
    private String uploadedAt;

    @Column(name = "\"homeworkId\"")
    private String homeworkId;

    @Column(name = "\"classworkId\"")
    private String classworkId;

    @Column(name = "\"feeId\"")
    private String feeId;

    @Column(name = "\"grievanceId\"")
    private String grievanceId;

    @Column(name = "\"homeworkSubmissionId\"")
    private String homeworkSubmissionId;

    @Column(name = "\"interactiveAssignmentId\"")
    private Long interactiveAssignmentId;

    @Column(name = "\"schoolId\"")
    private String schoolId;
}
