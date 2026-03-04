package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.FeedbackDto;
import com.shiksha.api.dto.ParentFeedbackDto;
import com.shiksha.api.entity.Feedback;
import com.shiksha.api.entity.ParentFeedback;
import com.shiksha.api.entity.ParentSubmittedFeedback;
import com.shiksha.api.repository.FeedbackRepository;
import com.shiksha.api.repository.ParentFeedbackRepository;
import com.shiksha.api.repository.ParentSubmittedFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ParentFeedbackRepository parentFeedbackRepository;
    private final ParentSubmittedFeedbackRepository parentSubmittedFeedbackRepository;

    // ----- Feedback (user feedback / grievances) -----

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public List<Feedback> getFeedbackByUser(String userId) {
        return feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Feedback> getFeedbackByStatus(String status) {
        return feedbackRepository.findByStatus(status);
    }

    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
    }

    @Transactional
    public Feedback createFeedback(String userId, FeedbackDto.CreateRequest request) {
        Feedback feedback = Feedback.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .userId(userId)
                .status("open")
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return feedbackRepository.save(feedback);
    }

    @Transactional
    public Feedback createFeedback(FeedbackDto.CreateRequest request) {
        return createFeedback(null, request);
    }

    @Transactional
    public Feedback updateFeedback(Long id, FeedbackDto.UpdateRequest request) {
        Feedback feedback = getFeedbackById(id);
        if (request.getTitle() != null) feedback.setTitle(request.getTitle());
        if (request.getDescription() != null) feedback.setDescription(request.getDescription());
        if (request.getStatus() != null) feedback.setStatus(request.getStatus());
        if (request.getNote() != null) feedback.setNote(request.getNote());
        feedback.setUpdatedAt(Instant.now().toString());
        return feedbackRepository.save(feedback);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    public FeedbackDto.Response toFeedbackResponse(Feedback f) {
        return FeedbackDto.Response.builder()
                .id(f.getId())
                .title(f.getTitle())
                .description(f.getDescription())
                .status(f.getStatus())
                .note(f.getNote())
                .userId(f.getUserId())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }

    public FeedbackDto.Response toResponse(Feedback f) {
        return toFeedbackResponse(f);
    }

    @Transactional
    public Feedback updateFeedbackStatus(Long id, String status) {
        Feedback feedback = getFeedbackById(id);
        feedback.setStatus(status);
        feedback.setUpdatedAt(Instant.now().toString());
        return feedbackRepository.save(feedback);
    }

    // ----- Parent Feedback Forms (teacher-designed) -----

    public List<ParentFeedback> getAllParentFeedbackForms() {
        return parentFeedbackRepository.findAll();
    }

    public List<ParentFeedback> getParentFeedbackByClass(String classId) {
        return parentFeedbackRepository.findByClassId(classId);
    }

    public ParentFeedback getParentFeedbackById(String id) {
        return parentFeedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent feedback form not found"));
    }

    @Transactional
    public ParentFeedback createParentFeedback(ParentFeedbackDto.CreateRequest request) {
        ParentFeedback form = ParentFeedback.builder()
                .id(UUID.randomUUID().toString())
                .studentName(request.getStudentName())
                .classId(request.getClassId())
                .month(request.getMonth())
                .goodThings(request.getGoodThings())
                .needToImprove(request.getNeedToImprove())
                .bestCanDo(request.getBestCanDo())
                .attendancePercentage(request.getAttendancePercentage())
                .studentPhotoUrl(request.getStudentPhotoUrl())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return parentFeedbackRepository.save(form);
    }

    @Transactional
    public ParentFeedback createParentFeedbackForm(ParentFeedbackDto.CreateRequest request) {
        return createParentFeedback(request);
    }

    public ParentFeedbackDto.Response toParentFeedbackResponse(ParentFeedback pf) {
        return ParentFeedbackDto.Response.builder()
                .id(pf.getId())
                .studentName(pf.getStudentName())
                .classId(pf.getClassId())
                .className(pf.getSchoolClass() != null ? pf.getSchoolClass().getName() : null)
                .month(pf.getMonth())
                .goodThings(pf.getGoodThings())
                .needToImprove(pf.getNeedToImprove())
                .bestCanDo(pf.getBestCanDo())
                .attendancePercentage(pf.getAttendancePercentage())
                .studentPhotoUrl(pf.getStudentPhotoUrl())
                .createdAt(pf.getCreatedAt())
                .build();
    }

    // ----- Parent Submitted Feedback -----

    public List<ParentSubmittedFeedback> getSubmittedFeedbackByClass(String classId) {
        return parentSubmittedFeedbackRepository.findByClassId(classId);
    }

    public List<ParentSubmittedFeedback> getSubmissionsByForm(String formId) {
        // Return all submissions; in a real scenario would filter by form ID
        return parentSubmittedFeedbackRepository.findAll();
    }

    public List<ParentSubmittedFeedback> getSubmittedByStatus(String status) {
        return parentSubmittedFeedbackRepository.findByStatus(status);
    }

    @Transactional
    public ParentSubmittedFeedback submitParentFeedback(ParentFeedbackDto.SubmitRequest request) {
        ParentSubmittedFeedback submission = ParentSubmittedFeedback.builder()
                .id(UUID.randomUUID().toString())
                .studentName(request.getStudentName())
                .classId(request.getClassId())
                .month(request.getMonth())
                .parentName(request.getParentName())
                .parentRelation(request.getParentRelation())
                .parentPhone(request.getParentPhone())
                .parentEmail(request.getParentEmail())
                .progressFeedback(request.getProgressFeedback())
                .feedback(request.getFeedback())
                .homeActivities(request.getHomeActivities())
                .improvementAreas(request.getImprovementAreas())
                .questionsConcerns(request.getQuestionsConcerns())
                .status("pending")
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return parentSubmittedFeedbackRepository.save(submission);
    }

    @Transactional
    public ParentSubmittedFeedback submitParentFeedback(String formId, ParentFeedbackDto.SubmitRequest request) {
        return submitParentFeedback(request);
    }

    public ParentFeedbackDto.SubmittedResponse toSubmittedResponse(ParentSubmittedFeedback psf) {
        return ParentFeedbackDto.SubmittedResponse.builder()
                .id(psf.getId())
                .studentName(psf.getStudentName())
                .classId(psf.getClassId())
                .month(psf.getMonth())
                .parentName(psf.getParentName())
                .parentRelation(psf.getParentRelation())
                .parentPhone(psf.getParentPhone())
                .progressFeedback(psf.getProgressFeedback())
                .feedback(psf.getFeedback())
                .status(psf.getStatus())
                .createdAt(psf.getCreatedAt())
                .build();
    }
}
