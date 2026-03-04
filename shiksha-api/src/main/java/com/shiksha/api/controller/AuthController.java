package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.AuthDto;
import com.shiksha.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Login successful"));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse result = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Registration successful"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> refreshToken(
            @Valid @RequestBody AuthDto.RefreshRequest request) {
        AuthDto.AuthResponse result = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Token refreshed"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication) {
        String userId = extractUserId(authentication);
        authService.logout(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<AuthDto.UserInfo>> getProfile(Authentication authentication) {
        String userId = extractUserId(authentication);
        AuthDto.UserInfo profile = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/device")
    @Operation(summary = "Register device push token")
    public ResponseEntity<ApiResponse<Void>> registerDevice(
            Authentication authentication,
            @Valid @RequestBody AuthDto.RegisterDeviceRequest request) {
        String userId = extractUserId(authentication);
        authService.registerDevice(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Device registered"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        String userId = extractUserId(authentication);
        authService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed"));
    }

    private String extractUserId(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userDetails.getUsername(); // we use userId as username
    }
}
