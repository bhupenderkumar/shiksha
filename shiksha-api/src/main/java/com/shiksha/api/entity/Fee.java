package com.shiksha.api.entity;

import com.shiksha.api.common.enums.FeeStatus;
import com.shiksha.api.common.enums.FeeType;
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
@Table(name = "\"Fee\"", schema = "school")
public class Fee {

    @Id
    private String id;

    @Column(name = "\"studentId\"", nullable = false)
    private String studentId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "\"feeType\"", nullable = false)
    private FeeType feeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status;

    @Column(name = "\"dueDate\"", nullable = false)
    private String dueDate;

    @Column(name = "\"paymentDate\"")
    private String paymentDate;

    @Column(name = "\"paymentMethod\"")
    private String paymentMethod;

    @Column(name = "\"receiptNumber\"")
    private String receiptNumber;

    @Column(name = "\"createdAt\"", nullable = false)
    private String createdAt;

    @Column(name = "\"updatedAt\"", nullable = false)
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"studentId\"", insertable = false, updatable = false)
    private Student student;
}
