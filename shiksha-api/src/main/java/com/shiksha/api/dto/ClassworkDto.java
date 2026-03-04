package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ClassworkDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;
        @NotBlank(message = "Description is required")
        private String description;
        @NotBlank(message = "Date is required")
        private String date;
        @NotBlank(message = "Class ID is required")
        private String classId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private String date;
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
        private String date;
        private String classId;
        private String className;
        private String createdAt;
        private String updatedAt;
        private java.util.List<FileDto.Response> files;
    }
}
