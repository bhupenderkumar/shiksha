package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.AdmissionDto;
import com.shiksha.api.entity.ProspectiveStudent;
import com.shiksha.api.service.AdmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admissions")
@RequiredArgsConstructor
@Tag(name = "Admissions", description = "Admission enquiry management endpoints")
public class AdmissionController {

    private final AdmissionService admissionService;

    @GetMapping
    @Operation(summary = "Get all enquiries for a school")
    public ResponseEntity<ApiResponse<List<AdmissionDto.Response>>> getBySchool(
            @RequestParam String schoolId) {
        List<AdmissionDto.Response> list = admissionService.getEnquiriesBySchool(schoolId)
                .stream().map(admissionService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get enquiries by status")
    public ResponseEntity<ApiResponse<List<AdmissionDto.Response>>> getByStatus(
            @RequestParam String schoolId,
            @PathVariable String status) {
        List<AdmissionDto.Response> list = admissionService.getEnquiriesByStatus(schoolId, status)
                .stream().map(admissionService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get enquiry by ID")
    public ResponseEntity<ApiResponse<AdmissionDto.Response>> getById(@PathVariable String id) {
        AdmissionDto.Response response = admissionService.toResponse(admissionService.getEnquiryById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create an admission enquiry")
    public ResponseEntity<ApiResponse<AdmissionDto.Response>> create(
            @Valid @RequestBody AdmissionDto.CreateRequest request) {
        ProspectiveStudent student = admissionService.createEnquiry(request);
        return ResponseEntity.ok(ApiResponse.success(admissionService.toResponse(student), "Enquiry created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an admission enquiry")
    public ResponseEntity<ApiResponse<AdmissionDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody AdmissionDto.UpdateRequest request) {
        ProspectiveStudent student = admissionService.updateEnquiry(id, request);
        return ResponseEntity.ok(ApiResponse.success(admissionService.toResponse(student), "Enquiry updated"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update enquiry status")
    public ResponseEntity<ApiResponse<AdmissionDto.Response>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        ProspectiveStudent student = admissionService.updateEnquiryStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(admissionService.toResponse(student), "Status updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an admission enquiry")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        admissionService.deleteEnquiry(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Enquiry deleted"));
    }
}
