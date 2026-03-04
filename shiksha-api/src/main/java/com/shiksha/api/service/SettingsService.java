package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.entity.Settings;
import com.shiksha.api.entity.Profile;
import com.shiksha.api.repository.SettingsRepository;
import com.shiksha.api.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;
    private final ProfileRepository profileRepository;

    // ----- School Settings -----

    @Cacheable(value = "settings")
    public List<Settings> getAllSettings() {
        return settingsRepository.findAll();
    }

    public Settings getSettings(String schoolId) {
        List<Settings> all = settingsRepository.findAll();
        return all.isEmpty() ? null : all.get(0);
    }

    public Settings getSettingsById(Long id) {
        return settingsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found with id: " + id));
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public Settings updateSettings(Long id, String schoolName, String address, String phone,
                                    String email, String website, String logoUrl, String description) {
        Settings settings = getSettingsById(id);
        if (schoolName != null) settings.setSchoolName(schoolName);
        if (address != null) settings.setAddress(address);
        if (phone != null) settings.setPhone(phone);
        if (email != null) settings.setEmail(email);
        if (website != null) settings.setWebsite(website);
        if (logoUrl != null) settings.setLogoUrl(logoUrl);
        if (description != null) settings.setDescription(description);
        settings.setUpdatedAt(Instant.now().toString());
        return settingsRepository.save(settings);
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public Settings updateSettings(String schoolId, Settings incoming) {
        Settings settings = getSettings(schoolId);
        if (settings == null) {
            incoming.setCreatedAt(Instant.now().toString());
            incoming.setUpdatedAt(Instant.now().toString());
            return settingsRepository.save(incoming);
        }
        if (incoming.getSchoolName() != null) settings.setSchoolName(incoming.getSchoolName());
        if (incoming.getAddress() != null) settings.setAddress(incoming.getAddress());
        if (incoming.getPhone() != null) settings.setPhone(incoming.getPhone());
        if (incoming.getEmail() != null) settings.setEmail(incoming.getEmail());
        if (incoming.getWebsite() != null) settings.setWebsite(incoming.getWebsite());
        if (incoming.getLogoUrl() != null) settings.setLogoUrl(incoming.getLogoUrl());
        if (incoming.getDescription() != null) settings.setDescription(incoming.getDescription());
        settings.setUpdatedAt(Instant.now().toString());
        return settingsRepository.save(settings);
    }

    // ----- User Profiles -----

    public Profile getProfileByUserId(String userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
    }

    public Profile getProfile(String userId) {
        return getProfileByUserId(userId);
    }

    @Transactional
    public Profile upsertProfile(String userId, String fullName, String role, String avatarUrl) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElse(Profile.builder().id(userId).userId(userId).build());
        if (fullName != null) profile.setFullName(fullName);
        if (role != null) profile.setRole(role);
        if (avatarUrl != null) profile.setAvatarUrl(avatarUrl);
        return profileRepository.save(profile);
    }

    @Transactional
    public Profile upsertProfile(String userId, Profile incoming) {
        return upsertProfile(userId, incoming.getFullName(), incoming.getRole(), incoming.getAvatarUrl());
    }
}
