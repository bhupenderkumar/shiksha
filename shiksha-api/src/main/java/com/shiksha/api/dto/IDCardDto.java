package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class IDCardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Father name is required")
        private String fatherName;
        @NotBlank(message = "Mother name is required")
        private String motherName;
        private String dateOfBirth;
        private String address;
        private String classId;
        private String fatherMobile;
        private String motherMobile;
        private String studentPhotoUrl;
        private String fatherPhotoUrl;
        private String motherPhotoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String studentName;
        private String fatherName;
        private String motherName;
        private String dateOfBirth;
        private String address;
        private String classId;
        private String fatherMobile;
        private String motherMobile;
        private String studentPhotoUrl;
        private String fatherPhotoUrl;
        private String motherPhotoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentName;
        private String fatherName;
        private String motherName;
        private String dateOfBirth;
        private String address;
        private String classId;
        private String className;
        private String fatherMobile;
        private String motherMobile;
        private String studentPhotoUrl;
        private String fatherPhotoUrl;
        private String motherPhotoUrl;
        private Integer downloadCount;
        private String createdAt;
    }
}
