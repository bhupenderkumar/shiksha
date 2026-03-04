package com.shiksha.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FileDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String fileName;
        private String filePath;
        private String fileType;
        private String uploadedBy;
        private String uploadedAt;
        private String downloadUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadResponse {
        private String fileName;
        private String fileUrl;
        private String objectName;
        private String contentType;
        private long size;
    }
}
