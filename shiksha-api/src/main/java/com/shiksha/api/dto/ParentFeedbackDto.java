package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ParentFeedbackDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Class ID is required")
        private String classId;
        @NotBlank(message = "Month is required")
        private String month;
        private String goodThings;
        private String needToImprove;
        private String bestCanDo;
        private Integer attendancePercentage;
        private String studentPhotoUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitRequest {
        @NotBlank(message = "Student name is required")
        private String studentName;
        @NotBlank(message = "Class ID is required")
        private String classId;
        @NotBlank(message = "Month is required")
        private String month;
        @NotBlank(message = "Parent name is required")
        private String parentName;
        @NotBlank(message = "Parent relation is required")
        private String parentRelation;
        private String parentPhone;
        private String parentEmail;
        @NotBlank(message = "Progress feedback is required")
        private String progressFeedback;
        private String feedback;
        private String homeActivities;
        private String improvementAreas;
        private String questionsConcerns;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentName;
        private String classId;
        private String className;
        private String month;
        private String goodThings;
        private String needToImprove;
        private String bestCanDo;
        private Integer attendancePercentage;
        private String studentPhotoUrl;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmittedResponse {
        private String id;
        private String studentName;
        private String classId;
        private String month;
        private String parentName;
        private String parentRelation;
        private String parentPhone;
        private String progressFeedback;
        private String feedback;
        private String status;
        private String createdAt;
    }
}
