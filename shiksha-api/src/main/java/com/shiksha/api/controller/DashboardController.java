package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.DashboardDto;
import com.shiksha.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDto.StatsResponse>> getStats(
            @RequestParam String schoolId) {
        DashboardDto.StatsResponse stats = dashboardService.getDashboardStats(schoolId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
