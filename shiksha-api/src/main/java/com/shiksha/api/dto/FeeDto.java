package com.shiksha.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class FeeDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Student ID is required")
        private String studentId;
        @NotNull(message = "Amount is required")
        private BigDecimal amount;
        @NotBlank(message = "Fee type is required")
        private String feeType;
        @NotBlank(message = "Due date is required")
        private String dueDate;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private BigDecimal amount;
        private String feeType;
        private String status;
        private String dueDate;
        private String paymentDate;
        private String paymentMethod;
        private String receiptNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String studentId;
        private String studentName;
        private BigDecimal amount;
        private String feeType;
        private String status;
        private String dueDate;
        private String paymentDate;
        private String paymentMethod;
        private String receiptNumber;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        @NotNull(message = "Amount is required")
        private BigDecimal amount;
        @NotBlank(message = "Payment method is required")
        private String paymentMethod;
        private String receiptUrl;
        private Integer feeMonth;
        private Integer feeYear;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private String id;
        private String studentId;
        private BigDecimal amountReceived;
        private BigDecimal balanceRemaining;
        private String paymentDate;
        private String paymentMethod;
        private String paymentStatus;
        private String receiptUrl;
        private Integer feeMonth;
        private Integer feeYear;
        private String notes;
    }
}
