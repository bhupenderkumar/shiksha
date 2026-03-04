package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.SportsDto;
import com.shiksha.api.entity.SportsEnrollment;
import com.shiksha.api.service.SportsEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sports")
@RequiredArgsConstructor
@Tag(name = "Sports", description = "Sports enrollment management endpoints")
public class SportsController {

    private final SportsEnrollmentService sportsEnrollmentService;

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get sports enrollments for a student")
    public ResponseEntity<ApiResponse<List<SportsDto.Response>>> getByStudent(
            @PathVariable String studentId) {
        List<SportsDto.Response> list = sportsEnrollmentService.getEnrollmentsByStudent(studentId)
                .stream().map(sportsEnrollmentService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get sports enrollments for a class")
    public ResponseEntity<ApiResponse<List<SportsDto.Response>>> getByClass(
            @PathVariable String classId) {
        List<SportsDto.Response> list = sportsEnrollmentService.getEnrollmentsByClass(classId)
                .stream().map(sportsEnrollmentService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Operation(summary = "Enroll in sports")
    public ResponseEntity<ApiResponse<SportsDto.Response>> enroll(
            @Valid @RequestBody SportsDto.EnrollRequest request) {
        SportsEnrollment enrollment = sportsEnrollmentService.enroll(request);
        return ResponseEntity.ok(ApiResponse.success(sportsEnrollmentService.toResponse(enrollment), "Enrolled successfully"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update enrollment status")
    public ResponseEntity<ApiResponse<SportsDto.Response>> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        SportsEnrollment enrollment = sportsEnrollmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(sportsEnrollmentService.toResponse(enrollment), "Status updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete sports enrollment")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        sportsEnrollmentService.deleteEnrollment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Enrollment deleted"));
    }
}
