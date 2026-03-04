package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class StudentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        private String name;
        @NotBlank(message = "Admission number is required")
        private String admissionNumber;
        @NotBlank(message = "Class ID is required")
        private String classId;
        @NotBlank(message = "Date of birth is required")
        private String dateOfBirth;
        @NotBlank(message = "Gender is required")
        private String gender;
        private String bloodGroup;
        @NotBlank(message = "Address is required")
        private String address;
        @NotBlank(message = "Contact number is required")
        private String contactNumber;
        @NotBlank(message = "Parent name is required")
        private String parentName;
        @NotBlank(message = "Parent contact is required")
        private String parentContact;
        @NotBlank(message = "Parent email is required")
        private String parentEmail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String classId;
        private String dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
        private String contactNumber;
        private String parentName;
        private String parentContact;
        private String parentEmail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String name;
        private String admissionNumber;
        private String classId;
        private String className;
        private String dateOfBirth;
        private String gender;
        private String bloodGroup;
        private String address;
        private String contactNumber;
        private String parentName;
        private String parentContact;
        private String parentEmail;
        private String createdAt;
        private String updatedAt;
    }
}
