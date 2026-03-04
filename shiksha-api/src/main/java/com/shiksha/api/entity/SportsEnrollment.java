package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"SportsEnrollment\"", schema = "school")
public class SportsEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "\"studentName\"", nullable = false)
    private String studentName;

    @Column(name = "\"parentName\"", nullable = false)
    private String parentName;

    @Column(name = "\"contactNumber\"", nullable = false)
    private String contactNumber;

    @Column(name = "\"classId\"")
    private String classId;

    @Column(name = "\"className\"", nullable = false)
    private String className;

    @Column(name = "\"selectedGames\"", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] selectedGames;

    @Column(name = "\"specialNotes\"")
    private String specialNotes;

    @Column(name = "\"status\"", nullable = false)
    @Builder.Default
    private String status = "ENROLLED";

    @Column(name = "\"enrolledAt\"", nullable = false)
    private String enrolledAt;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
