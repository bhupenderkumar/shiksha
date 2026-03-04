package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "service", "shiksha-api"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
