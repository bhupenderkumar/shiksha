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
@Table(name = "\"AdmissionProcess\"", schema = "school")
public class AdmissionProcess {

    @Id
    private String id;

    @Column(name = "\"prospectiveStudentId\"", nullable = false)
    private String prospectiveStudentId;

    @Column(name = "\"assignedClassId\"")
    private String assignedClassId;

    @Column(name = "\"interviewDate\"")
    private String interviewDate;

    @Column(name = "\"interviewNotes\"")
    private String interviewNotes;

    @Column(name = "\"documentsRequired\"", columnDefinition = "jsonb")
    private String documentsRequired;

    @Column(name = "\"documentsSubmitted\"", columnDefinition = "jsonb")
    private String documentsSubmitted;

    @Column(name = "\"feeDetails\"", columnDefinition = "jsonb")
    private String feeDetails;

    @Column(name = "\"admissionNumber\"")
    private String admissionNumber;

    @Column(name = "\"approvedBy\"")
    private String approvedBy;

    @Column(name = "\"studentId\"")
    private String studentId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"prospectiveStudentId\"", insertable = false, updatable = false)
    private ProspectiveStudent prospectiveStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"assignedClassId\"", insertable = false, updatable = false)
    private SchoolClass assignedClass;
}
