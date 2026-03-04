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
@Table(name = "\"Student\"", schema = "school")
public class Student {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "\"admissionNumber\"", nullable = false)
    private String admissionNumber;

    @Column(name = "\"classId\"", nullable = false)
    private String classId;

    @Column(name = "\"dateOfBirth\"", nullable = false)
    private String dateOfBirth;

    @Column(nullable = false)
    private String gender;

    @Column(name = "\"bloodGroup\"")
    private String bloodGroup;

    @Column(nullable = false)
    private String address;

    @Column(name = "\"contactNumber\"", nullable = false)
    private String contactNumber;

    @Column(name = "\"parentName\"", nullable = false)
    private String parentName;

    @Column(name = "\"parentContact\"", nullable = false)
    private String parentContact;

    @Column(name = "\"parentEmail\"", nullable = false)
    private String parentEmail;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"classId\"", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
