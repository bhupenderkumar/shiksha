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
@Table(name = "\"TimeTable\"", schema = "school")
public class TimeTable {

    @Id
    private String id;

    @Column(name = "\"classId\"", nullable = false)
    private String classId;

    @Column(name = "\"subjectId\"", nullable = false)
    private String subjectId;

    @Column(nullable = false)
    private int day;

    @Column(name = "\"startTime\"", nullable = false)
    private String startTime;

    @Column(name = "\"endTime\"", nullable = false)
    private String endTime;

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
