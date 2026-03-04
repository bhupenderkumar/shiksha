package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.SportsDto;
import com.shiksha.api.entity.SportsEnrollment;
import com.shiksha.api.repository.SportsEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SportsEnrollmentService {

    private final SportsEnrollmentRepository sportsEnrollmentRepository;

    public List<SportsEnrollment> getByClass(String classId) {
        return sportsEnrollmentRepository.findByClassId(classId);
    }

    public List<SportsEnrollment> getEnrollmentsByClass(String classId) {
        return getByClass(classId);
    }

    public List<SportsEnrollment> getEnrollmentsByStudent(String studentId) {
        return sportsEnrollmentRepository.findByStudentName(studentId);
    }

    public List<SportsEnrollment> getByStatus(String status) {
        return sportsEnrollmentRepository.findByStatus(status);
    }

    public SportsEnrollment getById(String id) {
        return sportsEnrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sports enrollment not found with id: " + id));
    }

    @Transactional
    public SportsEnrollment enroll(SportsDto.EnrollmentRequest request) {
        SportsEnrollment enrollment = SportsEnrollment.builder()
                .studentName(request.getStudentName())
                .parentName(request.getParentName())
                .contactNumber(request.getContactNumber())
                .classId(request.getClassId())
                .className(request.getClassName())
                .selectedGames(request.getSelectedGames() != null
                        ? request.getSelectedGames().toArray(new String[0]) : null)
                .specialNotes(request.getSpecialNotes())
                .status("ENROLLED")
                .enrolledAt(Instant.now().toString())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return sportsEnrollmentRepository.save(enrollment);
    }

    @Transactional
    public SportsEnrollment enroll(SportsDto.EnrollRequest request) {
        SportsEnrollment enrollment = SportsEnrollment.builder()
                .studentName(request.getStudentName())
                .parentName(request.getParentName())
                .contactNumber(request.getContactNumber())
                .classId(request.getClassId())
                .className(request.getClassName())
                .selectedGames(request.getSelectedGames() != null
                        ? request.getSelectedGames().toArray(new String[0]) : null)
                .specialNotes(request.getSpecialNotes())
                .status("ENROLLED")
                .enrolledAt(Instant.now().toString())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return sportsEnrollmentRepository.save(enrollment);
    }

    @Transactional
    public SportsEnrollment updateStatus(String id, String status) {
        SportsEnrollment enrollment = getById(id);
        enrollment.setStatus(status);
        enrollment.setUpdatedAt(Instant.now().toString());
        return sportsEnrollmentRepository.save(enrollment);
    }

    @Transactional
    public void delete(String id) {
        SportsEnrollment enrollment = getById(id);
        sportsEnrollmentRepository.delete(enrollment);
    }

    @Transactional
    public void deleteEnrollment(String id) {
        delete(id);
    }

    public SportsDto.Response toResponse(SportsEnrollment e) {
        return SportsDto.Response.builder()
                .id(e.getId())
                .studentName(e.getStudentName())
                .parentName(e.getParentName())
                .contactNumber(e.getContactNumber())
                .classId(e.getClassId())
                .className(e.getClassName())
                .selectedGames(e.getSelectedGames() != null ? Arrays.asList(e.getSelectedGames()) : null)
                .specialNotes(e.getSpecialNotes())
                .status(e.getStatus())
                .enrolledAt(e.getEnrolledAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    public SportsDto.EnrollmentResponse toEnrollmentResponse(SportsEnrollment e) {
        return SportsDto.EnrollmentResponse.builder()
                .id(e.getId())
                .studentName(e.getStudentName())
                .parentName(e.getParentName())
                .contactNumber(e.getContactNumber())
                .classId(e.getClassId())
                .className(e.getClassName())
                .selectedGames(e.getSelectedGames() != null ? Arrays.asList(e.getSelectedGames()) : null)
                .specialNotes(e.getSpecialNotes())
                .status(e.getStatus())
                .enrolledAt(e.getEnrolledAt())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
