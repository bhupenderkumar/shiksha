package com.shiksha.api.entity;

import com.shiksha.api.common.enums.GrievanceStatus;
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
@Table(name = "\"Grievance\"", schema = "school")
public class Grievance {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrievanceStatus status;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "\"studentId\"", nullable = false)
    private String studentId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"studentId\"", insertable = false, updatable = false)
    private Student student;
}
