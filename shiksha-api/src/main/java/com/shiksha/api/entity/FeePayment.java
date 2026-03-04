package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fee_payments", schema = "school")
public class FeePayment {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "amount_received", nullable = false)
    private BigDecimal amountReceived;

    @Column(name = "balance_remaining")
    private BigDecimal balanceRemaining;

    @Column(name = "payment_date", nullable = false)
    private String paymentDate;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "receipt_url", nullable = false)
    private String receiptUrl;

    @Column(name = "fee_month")
    private Integer feeMonth;

    @Column(name = "fee_year")
    private Integer feeYear;

    @Column
    private String notes;

    @Column(name = "has_updates")
    private Boolean hasUpdates;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
