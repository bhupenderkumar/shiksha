package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class HomeworkDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Description is required")
        private String description;
        @NotBlank(message = "Due date is required")
        private String dueDate;
        @NotBlank(message = "Subject ID is required")
        private String subjectId;
        private String classId;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private String dueDate;
        private String status;
        private String subjectId;
        private String classId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String title;
        private String description;
        private String dueDate;
        private String status;
        private String classId;
        private String className;
        private String subjectId;
        private String subjectName;
        private String createdAt;
        private String updatedAt;
        private java.util.List<FileDto.Response> files;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        @NotBlank(message = "Student ID is required")
        private String studentId;
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeRequest {
        private String grade;
        private String feedback;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionResponse {
        private String id;
        private String homeworkId;
        private String studentId;
        private String studentName;
        private String status;
        private String submittedAt;
        private String grade;
        private String feedback;
    }
}
