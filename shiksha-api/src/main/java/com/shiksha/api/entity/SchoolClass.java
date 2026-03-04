package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"Class\"", schema = "school")
@EntityListeners(AuditingEntityListener.class)
public class SchoolClass {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "\"roomNumber\"")
    private String roomNumber;

    @Column(name = "\"schoolId\"", nullable = false)
    private String schoolId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"schoolId\"", insertable = false, updatable = false)
    private School school;

    @OneToMany(mappedBy = "schoolClass", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Student> students = new ArrayList<>();

    @OneToMany(mappedBy = "schoolClass", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Subject> subjects = new ArrayList<>();
}
