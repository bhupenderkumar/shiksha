package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.entity.Profile;
import com.shiksha.api.entity.Settings;
import com.shiksha.api.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Settings & Profile", description = "School settings and user profile endpoints")
public class SettingsController {

    private final SettingsService settingsService;

    // Settings endpoints
    @GetMapping("/settings/{schoolId}")
    @Operation(summary = "Get school settings")
    public ResponseEntity<ApiResponse<Settings>> getSettings(@PathVariable String schoolId) {
        Settings settings = settingsService.getSettings(schoolId);
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/settings/{schoolId}")
    @Operation(summary = "Update school settings")
    public ResponseEntity<ApiResponse<Settings>> updateSettings(
            @PathVariable String schoolId,
            @Valid @RequestBody Settings settings) {
        Settings updated = settingsService.updateSettings(schoolId, settings);
        return ResponseEntity.ok(ApiResponse.success(updated, "Settings updated"));
    }

    // Profile endpoints
    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse<Profile>> getProfile(@PathVariable String userId) {
        Profile profile = settingsService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile/{userId}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<Profile>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody Profile profile) {
        Profile updated = settingsService.upsertProfile(userId, profile);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated"));
    }
}
