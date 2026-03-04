package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdmissionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Parent name is required")
        private String parentName;
        @NotBlank(message = "Email is required")
        private String email;
        @NotBlank(message = "Contact number is required")
        private String contactNumber;
        @NotBlank(message = "Date of birth is required")
        private String dateOfBirth;
        @NotBlank(message = "Gender is required")
        private String gender;
        @NotBlank(message = "Grade applying is required")
        private String gradeApplying;
        @NotBlank(message = "Address is required")
        private String address;
        private String currentSchool;
        private String bloodGroup;
        @NotBlank(message = "School ID is required")
        private String schoolId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String status;
        private String assignedTo;
        private String lastUpdateDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentName;
        private String parentName;
        private String email;
        private String contactNumber;
        private String dateOfBirth;
        private String gender;
        private String gradeApplying;
        private String address;
        private String currentSchool;
        private String bloodGroup;
        private String status;
        private String schoolId;
        private String assignedTo;
        private String appliedDate;
        private String createdAt;
        private String updatedAt;
    }
}
