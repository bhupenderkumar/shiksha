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
@Table(name = "\"Subject\"", schema = "school")
public class Subject {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Column(name = "\"classId\"", nullable = false)
    private String classId;

    @Column(name = "\"teacherId\"", nullable = false)
    private String teacherId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"teacherId\"", insertable = false, updatable = false)
    private Staff teacher;
}
