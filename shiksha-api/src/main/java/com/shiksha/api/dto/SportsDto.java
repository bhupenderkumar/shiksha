package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class SportsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Parent name is required")
        private String parentName;
        @NotBlank(message = "Contact number is required")
        private String contactNumber;
        private String classId;
        @NotBlank(message = "Class name is required")
        private String className;
        private List<String> selectedGames;
        private String specialNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Parent name is required")
        private String parentName;
        @NotBlank(message = "Contact number is required")
        private String contactNumber;
        private String classId;
        @NotBlank(message = "Class name is required")
        private String className;
        private List<String> selectedGames;
        private String specialNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentName;
        private String parentName;
        private String contactNumber;
        private String classId;
        private String className;
        private List<String> selectedGames;
        private String specialNotes;
        private String status;
        private String enrolledAt;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentResponse {
        private String id;
        private String studentName;
        private String parentName;
        private String contactNumber;
        private String classId;
        private String className;
        private List<String> selectedGames;
        private String specialNotes;
        private String status;
        private String enrolledAt;
        private String createdAt;
    }
}
