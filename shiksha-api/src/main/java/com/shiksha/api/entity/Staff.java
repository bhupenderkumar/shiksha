package com.shiksha.api.entity;

import com.shiksha.api.common.enums.StaffRole;
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
@Table(name = "\"Staff\"", schema = "school")
public class Staff {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(name = "\"contactNumber\"", nullable = false)
    private String contactNumber;

    @Column(name = "\"employeeId\"", nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String qualification;

    @Column(nullable = false)
    private int experience;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StaffRole role;

    @Column(name = "\"schoolId\"", nullable = false)
    private String schoolId;

    @Column(name = "\"joiningDate\"", nullable = false)
    private String joiningDate;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"schoolId\"", insertable = false, updatable = false)
    private School school;
}
