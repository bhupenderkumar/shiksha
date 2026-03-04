package com.shiksha.api.entity;

import com.shiksha.api.common.enums.EnquiryStatus;
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
@Table(name = "\"ProspectiveStudent\"", schema = "school")
public class ProspectiveStudent {

    @Id
    private String id;

    @Column(name = "\"studentName\"", nullable = false)
    private String studentName;

    @Column(name = "\"parentName\"", nullable = false)
    private String parentName;

    @Column(nullable = false)
    private String email;

    @Column(name = "\"contactNumber\"", nullable = false)
    private String contactNumber;

    @Column(name = "\"dateOfBirth\"", nullable = false)
    private String dateOfBirth;

    @Column(nullable = false)
    private String gender;

    @Column(name = "\"gradeApplying\"", nullable = false)
    private String gradeApplying;

    @Column(nullable = false)
    private String address;

    @Column(name = "\"currentSchool\"")
    private String currentSchool;

    @Column(name = "\"bloodGroup\"")
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EnquiryStatus status = EnquiryStatus.NEW;

    @Column(name = "\"schoolId\"", nullable = false)
    private String schoolId;

    @Column(name = "\"assignedTo\"")
    private String assignedTo;

    @Column(name = "\"appliedDate\"")
    private String appliedDate;

    @Column(name = "\"lastUpdateDate\"")
    private String lastUpdateDate;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"schoolId\"", insertable = false, updatable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"assignedTo\"", insertable = false, updatable = false)
    private Staff assignedStaff;
}
