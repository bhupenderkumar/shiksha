package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AttendanceDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkRequest {
        @NotBlank(message = "Class ID is required")
        private String classId;
        @NotBlank(message = "Date is required")
        private String date;
        @NotNull(message = "Attendance records are required")
        private List<AttendanceEntry> records;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceEntry {
        @NotBlank(message = "Student ID is required")
        private String studentId;
        @NotBlank(message = "Status is required")
        private String status;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentId;
        private String studentName;
        private String classId;
        private String date;
        private String status;
        private String description;
        private String createdBy;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private long totalDays;
        private long presentDays;
        private long absentDays;
        private long lateDays;
        private double attendancePercentage;
    }
}
