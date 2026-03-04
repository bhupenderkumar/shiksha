package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.AttendanceDto;
import com.shiksha.api.entity.Attendance;
import com.shiksha.api.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance management endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @Operation(summary = "Bulk mark attendance for a class")
    public ResponseEntity<ApiResponse<List<AttendanceDto.Response>>> markAttendance(
            @Valid @RequestBody AttendanceDto.MarkRequest request) {
        List<Attendance> records = attendanceService.markAttendance(request);
        List<AttendanceDto.Response> responses = records.stream()
                .map(attendanceService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses, "Attendance marked"));
    }

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get attendance for a class on a specific date")
    public ResponseEntity<ApiResponse<List<AttendanceDto.Response>>> getByClassAndDate(
            @PathVariable String classId,
            @RequestParam String date) {
        List<AttendanceDto.Response> list = attendanceService.getAttendanceByClassAndDate(classId, date)
                .stream().map(attendanceService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/student/{studentId}/summary")
    @Operation(summary = "Get attendance summary for a student")
    public ResponseEntity<ApiResponse<AttendanceDto.SummaryResponse>> getStudentSummary(
            @PathVariable String studentId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        AttendanceDto.SummaryResponse summary = attendanceService.getStudentSummary(studentId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
