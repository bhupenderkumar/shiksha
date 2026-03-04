package com.shiksha.api.service;

import com.shiksha.api.common.enums.FeeStatus;
import com.shiksha.api.common.enums.FeeType;
import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.FeeDto;
import com.shiksha.api.entity.Fee;
import com.shiksha.api.entity.FeePayment;
import com.shiksha.api.repository.FeePaymentRepository;
import com.shiksha.api.repository.FeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;
    private final FeePaymentRepository feePaymentRepository;

    public List<Fee> getFeesByStudent(String studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public List<Fee> getPendingFees(String studentId) {
        return feeRepository.findPendingByStudent(studentId);
    }

    public List<Fee> getOverdueFees() {
        String today = java.time.LocalDate.now().toString();
        return feeRepository.findOverdueFees(today);
    }

    public Fee getFeeById(String id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with id: " + id));
    }

    @Transactional
    public Fee createFee(FeeDto.CreateRequest request) {
        Fee fee = Fee.builder()
                .id(UUID.randomUUID().toString())
                .studentId(request.getStudentId())
                .amount(request.getAmount())
                .feeType(FeeType.valueOf(request.getFeeType()))
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? FeeStatus.valueOf(request.getStatus()) : FeeStatus.PENDING)
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return feeRepository.save(fee);
    }

    @Transactional
    public Fee updateFee(String id, FeeDto.UpdateRequest request) {
        Fee fee = getFeeById(id);
        if (request.getAmount() != null) fee.setAmount(request.getAmount());
        if (request.getFeeType() != null) fee.setFeeType(FeeType.valueOf(request.getFeeType()));
        if (request.getStatus() != null) fee.setStatus(FeeStatus.valueOf(request.getStatus()));
        if (request.getDueDate() != null) fee.setDueDate(request.getDueDate());
        if (request.getPaymentDate() != null) fee.setPaymentDate(request.getPaymentDate());
        if (request.getPaymentMethod() != null) fee.setPaymentMethod(request.getPaymentMethod());
        if (request.getReceiptNumber() != null) fee.setReceiptNumber(request.getReceiptNumber());
        fee.setUpdatedAt(Instant.now().toString());
        return feeRepository.save(fee);
    }

    @Transactional
    public FeePayment recordPayment(String studentId, BigDecimal amount, String paymentMethod,
                                     String receiptUrl, Integer feeMonth, Integer feeYear, String notes) {
        FeePayment payment = FeePayment.builder()
                .id(UUID.randomUUID().toString())
                .studentId(studentId)
                .amountReceived(amount)
                .paymentDate(Instant.now().toString())
                .paymentMethod(paymentMethod)
                .paymentStatus("completed")
                .receiptUrl(receiptUrl)
                .feeMonth(feeMonth)
                .feeYear(feeYear)
                .notes(notes)
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return feePaymentRepository.save(payment);
    }

    @Transactional
    public FeePayment recordPayment(String feeId, FeeDto.PaymentRequest request) {
        Fee fee = getFeeById(feeId);
        return recordPayment(
                fee.getStudentId(),
                request.getAmount(),
                request.getPaymentMethod(),
                request.getReceiptUrl(),
                request.getFeeMonth(),
                request.getFeeYear(),
                request.getNotes()
        );
    }

    public List<FeePayment> getPaymentsByStudent(String studentId) {
        return feePaymentRepository.findByStudentIdOrderByPaymentDateDesc(studentId);
    }

    public List<FeePayment> getPaymentsForFee(String feeId) {
        Fee fee = getFeeById(feeId);
        return feePaymentRepository.findByStudentIdOrderByPaymentDateDesc(fee.getStudentId());
    }

    @Transactional
    public void deleteFee(String id) {
        Fee fee = getFeeById(id);
        feeRepository.delete(fee);
    }

    public FeeDto.Response toResponse(Fee fee) {
        return FeeDto.Response.builder()
                .id(fee.getId())
                .studentId(fee.getStudentId())
                .studentName(fee.getStudent() != null ? fee.getStudent().getName() : null)
                .amount(fee.getAmount())
                .feeType(fee.getFeeType() != null ? fee.getFeeType().name() : null)
                .status(fee.getStatus() != null ? fee.getStatus().name() : null)
                .dueDate(fee.getDueDate())
                .paymentDate(fee.getPaymentDate())
                .paymentMethod(fee.getPaymentMethod())
                .receiptNumber(fee.getReceiptNumber())
                .createdAt(fee.getCreatedAt())
                .updatedAt(fee.getUpdatedAt())
                .build();
    }

    public FeeDto.PaymentResponse toPaymentResponse(FeePayment p) {
        return FeeDto.PaymentResponse.builder()
                .id(p.getId())
                .studentId(p.getStudentId())
                .amountReceived(p.getAmountReceived())
                .balanceRemaining(p.getBalanceRemaining())
                .paymentDate(p.getPaymentDate())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .receiptUrl(p.getReceiptUrl())
                .feeMonth(p.getFeeMonth())
                .feeYear(p.getFeeYear())
                .notes(p.getNotes())
                .build();
    }
}
