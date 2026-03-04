package com.shiksha.api.entity;

import com.shiksha.api.common.enums.AttendanceStatus;
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
@Table(name = "\"Attendance\"", schema = "school")
public class Attendance {

    @Id
    private String id;

    @Column(name = "\"studentId\"")
    private String studentId;

    @Column(name = "\"classId\"")
    private String classId;

    @Column
    private String date;

    @Enumerated(EnumType.STRING)
    @Column
    private AttendanceStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "\"createdBy\"")
    private String createdBy;

    @Column(name = "\"lastModifiedBy\"")
    private String lastModifiedBy;

    @Column(name = "\"createdAt\"")
    private String createdAt;

    @Column(name = "\"updatedAt\"")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"studentId\"", insertable = false, updatable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
