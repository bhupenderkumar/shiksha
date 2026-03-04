package com.shiksha.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DashboardDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsResponse {
        private long totalStudents;
        private long totalClasses;
        private long totalStaff;
        private long totalSubjects;
        private long pendingHomework;
        private long pendingFees;
        private long todayAttendanceCount;
        private double todayAttendancePercentage;
        private long newAdmissions;
        private long pendingFeedback;
    }
}
