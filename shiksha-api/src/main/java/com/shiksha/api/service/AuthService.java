package com.shiksha.api.service;

import com.shiksha.api.common.exception.BadRequestException;
import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.AuthDto;
import com.shiksha.api.entity.AppUser;
import com.shiksha.api.repository.AppUserRepository;
import com.shiksha.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            AppUser user = appUserRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String accessToken = jwtTokenProvider.generateAccessToken(
                    user.getId(), user.getEmail(), user.getRole());
            String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

            user.setRefreshToken(refreshToken);
            user.setLastLoginAt(Instant.now());
            appUserRepository.save(user);

            return buildAuthResponse(user, accessToken, refreshToken);

        } catch (AuthenticationException ex) {
            throw new BadRequestException("Invalid email or password");
        }
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        AppUser user = AppUser.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : "TEACHER")
                .schoolId(request.getSchoolId())
                .isActive(true)
                .build();

        user = appUserRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        user.setRefreshToken(refreshToken);
        appUserRepository.save(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(request.getRefreshToken());
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!request.getRefreshToken().equals(user.getRefreshToken())) {
            throw new BadRequestException("Refresh token mismatch — possible token reuse");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        user.setRefreshToken(newRefreshToken);
        appUserRepository.save(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRefreshToken(null);
        user.setPushToken(null);
        appUserRepository.save(user);
    }

    public AuthDto.UserInfo getProfile(String userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserInfo(user);
    }

    @Transactional
    public void registerDevice(String userId, AuthDto.RegisterDeviceRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPushToken(request.getPushToken());
        appUserRepository.save(user);
    }

    @Transactional
    public void changePassword(String userId, String currentPassword, String newPassword) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        appUserRepository.save(user);
    }

    // ----- Helpers -----

    private AuthDto.AuthResponse buildAuthResponse(AppUser user, String accessToken, String refreshToken) {
        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(toUserInfo(user))
                .build();
    }

    private AuthDto.UserInfo toUserInfo(AppUser user) {
        return AuthDto.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .schoolId(user.getSchoolId())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
