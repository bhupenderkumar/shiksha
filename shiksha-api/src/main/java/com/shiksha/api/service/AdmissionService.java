package com.shiksha.api.service;

import com.shiksha.api.common.enums.EnquiryStatus;
import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.AdmissionDto;
import com.shiksha.api.entity.AdmissionProcess;
import com.shiksha.api.entity.ProspectiveStudent;
import com.shiksha.api.repository.AdmissionProcessRepository;
import com.shiksha.api.repository.ProspectiveStudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final ProspectiveStudentRepository prospectiveStudentRepository;
    private final AdmissionProcessRepository admissionProcessRepository;

    public List<ProspectiveStudent> getAllEnquiries(String schoolId) {
        return prospectiveStudentRepository.findBySchoolId(schoolId);
    }

    public List<ProspectiveStudent> getEnquiriesBySchool(String schoolId) {
        return getAllEnquiries(schoolId);
    }

    public Page<ProspectiveStudent> getAllEnquiriesPaged(String schoolId, Pageable pageable) {
        return prospectiveStudentRepository.findBySchoolId(schoolId, pageable);
    }

    public List<ProspectiveStudent> getEnquiriesByStatus(String schoolId, EnquiryStatus status) {
        return prospectiveStudentRepository.findBySchoolIdAndStatus(schoolId, status);
    }

    public List<ProspectiveStudent> getEnquiriesByStatus(String schoolId, String status) {
        return getEnquiriesByStatus(schoolId, EnquiryStatus.valueOf(status));
    }

    public ProspectiveStudent getEnquiryById(String id) {
        return prospectiveStudentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found with id: " + id));
    }

    @Transactional
    public ProspectiveStudent createEnquiry(AdmissionDto.CreateRequest request) {
        ProspectiveStudent student = ProspectiveStudent.builder()
                .id(UUID.randomUUID().toString())
                .studentName(request.getStudentName())
                .parentName(request.getParentName())
                .email(request.getEmail())
                .contactNumber(request.getContactNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .gradeApplying(request.getGradeApplying())
                .address(request.getAddress())
                .currentSchool(request.getCurrentSchool())
                .bloodGroup(request.getBloodGroup())
                .schoolId(request.getSchoolId())
                .status(EnquiryStatus.NEW)
                .appliedDate(Instant.now().toString())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return prospectiveStudentRepository.save(student);
    }

    @Transactional
    public ProspectiveStudent updateEnquiry(String id, AdmissionDto.UpdateRequest request) {
        ProspectiveStudent student = getEnquiryById(id);
        if (request.getStatus() != null) student.setStatus(EnquiryStatus.valueOf(request.getStatus()));
        if (request.getAssignedTo() != null) student.setAssignedTo(request.getAssignedTo());
        if (request.getLastUpdateDate() != null) student.setLastUpdateDate(request.getLastUpdateDate());
        student.setUpdatedAt(Instant.now().toString());
        return prospectiveStudentRepository.save(student);
    }

    @Transactional
    public void deleteEnquiry(String id) {
        ProspectiveStudent student = getEnquiryById(id);
        prospectiveStudentRepository.delete(student);
    }

    @Transactional
    public ProspectiveStudent updateEnquiryStatus(String id, String status) {
        ProspectiveStudent student = getEnquiryById(id);
        student.setStatus(EnquiryStatus.valueOf(status));
        student.setUpdatedAt(Instant.now().toString());
        return prospectiveStudentRepository.save(student);
    }

    public Optional<AdmissionProcess> getAdmissionProcess(String prospectiveStudentId) {
        return admissionProcessRepository.findByProspectiveStudentId(prospectiveStudentId);
    }

    public AdmissionDto.Response toResponse(ProspectiveStudent ps) {
        return AdmissionDto.Response.builder()
                .id(ps.getId())
                .studentName(ps.getStudentName())
                .parentName(ps.getParentName())
                .email(ps.getEmail())
                .contactNumber(ps.getContactNumber())
                .dateOfBirth(ps.getDateOfBirth())
                .gender(ps.getGender())
                .gradeApplying(ps.getGradeApplying())
                .address(ps.getAddress())
                .currentSchool(ps.getCurrentSchool())
                .bloodGroup(ps.getBloodGroup())
                .status(ps.getStatus() != null ? ps.getStatus().name() : null)
                .schoolId(ps.getSchoolId())
                .assignedTo(ps.getAssignedTo())
                .appliedDate(ps.getAppliedDate())
                .createdAt(ps.getCreatedAt())
                .updatedAt(ps.getUpdatedAt())
                .build();
    }
}
