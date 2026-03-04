package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class NotificationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Message is required")
        private String message;
        @NotBlank(message = "Type is required")
        private String type;
        private String studentId;
        private String classId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String title;
        private String message;
        private String type;
        private boolean isRead;
        private String studentId;
        private String classId;
        private String createdAt;
    }
}
