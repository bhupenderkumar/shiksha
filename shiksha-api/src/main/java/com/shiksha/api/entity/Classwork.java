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
@Table(name = "\"Classwork\"", schema = "school")
public class Classwork {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String date;

    @Column(name = "\"classId\"", nullable = false)
    private String classId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
