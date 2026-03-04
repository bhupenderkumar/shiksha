package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.FeeDto;
import com.shiksha.api.entity.Fee;
import com.shiksha.api.entity.FeePayment;
import com.shiksha.api.service.FeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fees")
@RequiredArgsConstructor
@Tag(name = "Fees", description = "Fee management endpoints")
public class FeeController {

    private final FeeService feeService;

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get fees for a student")
    public ResponseEntity<ApiResponse<List<FeeDto.Response>>> getByStudent(
            @PathVariable String studentId) {
        List<FeeDto.Response> list = feeService.getFeesByStudent(studentId)
                .stream().map(feeService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/student/{studentId}/pending")
    @Operation(summary = "Get pending fees for a student")
    public ResponseEntity<ApiResponse<List<FeeDto.Response>>> getPendingByStudent(
            @PathVariable String studentId) {
        List<FeeDto.Response> list = feeService.getPendingFees(studentId)
                .stream().map(feeService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get all overdue fees")
    public ResponseEntity<ApiResponse<List<FeeDto.Response>>> getOverdue() {
        List<FeeDto.Response> list = feeService.getOverdueFees()
                .stream().map(feeService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get fee by ID")
    public ResponseEntity<ApiResponse<FeeDto.Response>> getById(@PathVariable String id) {
        FeeDto.Response response = feeService.toResponse(feeService.getFeeById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create a fee record")
    public ResponseEntity<ApiResponse<FeeDto.Response>> create(
            @Valid @RequestBody FeeDto.CreateRequest request) {
        Fee fee = feeService.createFee(request);
        return ResponseEntity.ok(ApiResponse.success(feeService.toResponse(fee), "Fee created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a fee record")
    public ResponseEntity<ApiResponse<FeeDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody FeeDto.UpdateRequest request) {
        Fee fee = feeService.updateFee(id, request);
        return ResponseEntity.ok(ApiResponse.success(feeService.toResponse(fee), "Fee updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a fee record")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Fee deleted"));
    }

    // Payment endpoints
    @PostMapping("/{feeId}/payments")
    @Operation(summary = "Record a payment for a fee")
    public ResponseEntity<ApiResponse<FeeDto.PaymentResponse>> recordPayment(
            @PathVariable String feeId,
            @Valid @RequestBody FeeDto.PaymentRequest request) {
        FeePayment payment = feeService.recordPayment(feeId, request);
        return ResponseEntity.ok(ApiResponse.success(feeService.toPaymentResponse(payment), "Payment recorded"));
    }

    @GetMapping("/{feeId}/payments")
    @Operation(summary = "Get payments for a fee")
    public ResponseEntity<ApiResponse<List<FeeDto.PaymentResponse>>> getPayments(
            @PathVariable String feeId) {
        List<FeeDto.PaymentResponse> list = feeService.getPaymentsForFee(feeId)
                .stream().map(feeService::toPaymentResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
