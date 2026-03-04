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
@Table(name = "\"IDCard\"", schema = "school")
public class IDCard {

    @Id
    private String id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "father_name", nullable = false)
    private String fatherName;

    @Column(name = "mother_name", nullable = false)
    private String motherName;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column
    private String address;

    @Column(name = "class_id")
    private String classId;

    @Column(name = "father_mobile")
    private String fatherMobile;

    @Column(name = "mother_mobile")
    private String motherMobile;

    @Column(name = "student_photo_url")
    private String studentPhotoUrl;

    @Column(name = "father_photo_url")
    private String fatherPhotoUrl;

    @Column(name = "mother_photo_url")
    private String motherPhotoUrl;

    @Column(name = "download_count")
    private Integer downloadCount;

    @Column(name = "created_at")
    private String createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
