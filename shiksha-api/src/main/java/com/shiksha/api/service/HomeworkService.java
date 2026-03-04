package com.shiksha.api.service;

import com.shiksha.api.common.enums.HomeworkStatus;
import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.HomeworkDto;
import com.shiksha.api.entity.Homework;
import com.shiksha.api.entity.HomeworkSubmission;
import com.shiksha.api.repository.HomeworkRepository;
import com.shiksha.api.repository.HomeworkSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkSubmissionRepository submissionRepository;

    public List<Homework> getHomeworkByClass(String classId) {
        return homeworkRepository.findByClassId(classId);
    }

    public Page<Homework> getHomeworkByClassPaged(String classId, Pageable pageable) {
        return homeworkRepository.findByClassIdOrderByCreatedAtDesc(classId, pageable);
    }

    public List<Homework> getHomeworkBySubject(String subjectId) {
        return homeworkRepository.findBySubjectId(subjectId);
    }

    public Homework getHomeworkById(String id) {
        return homeworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found with id: " + id));
    }

    public List<Homework> getOverdueHomework(String date) {
        return homeworkRepository.findOverdue(date);
    }

    @Transactional
    public Homework createHomework(HomeworkDto.CreateRequest request) {
        Homework homework = Homework.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getTitle())
                .description(request.getDescription())
                .classId(request.getClassId())
                .subjectId(request.getSubjectId())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? HomeworkStatus.valueOf(request.getStatus()) : HomeworkStatus.PENDING)
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return homeworkRepository.save(homework);
    }

    @Transactional
    public Homework updateHomework(String id, HomeworkDto.UpdateRequest request) {
        Homework homework = getHomeworkById(id);
        if (request.getTitle() != null) homework.setTitle(request.getTitle());
        if (request.getDescription() != null) homework.setDescription(request.getDescription());
        if (request.getDueDate() != null) homework.setDueDate(request.getDueDate());
        if (request.getStatus() != null) homework.setStatus(HomeworkStatus.valueOf(request.getStatus()));
        if (request.getSubjectId() != null) homework.setSubjectId(request.getSubjectId());
        if (request.getClassId() != null) homework.setClassId(request.getClassId());
        homework.setUpdatedAt(Instant.now().toString());
        return homeworkRepository.save(homework);
    }

    @Transactional
    public void deleteHomework(String id) {
        Homework homework = getHomeworkById(id);
        homeworkRepository.delete(homework);
    }

    // ----- Submissions -----

    public List<HomeworkSubmission> getSubmissions(String homeworkId) {
        return submissionRepository.findByHomeworkId(homeworkId);
    }

    public List<HomeworkSubmission> getSubmissionsByStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    @Transactional
    public HomeworkSubmission submitHomework(String homeworkId, String studentId, String content) {
        HomeworkSubmission submission = HomeworkSubmission.builder()
                .id(UUID.randomUUID().toString())
                .homeworkId(homeworkId)
                .studentId(studentId)
                .submittedAt(Instant.now().toString())
                .status(HomeworkStatus.SUBMITTED)
                .build();
        return submissionRepository.save(submission);
    }

    @Transactional
    public HomeworkSubmission submitHomework(String homeworkId, HomeworkDto.SubmitRequest request) {
        return submitHomework(homeworkId, request.getStudentId(), request.getContent());
    }

    @Transactional
    public HomeworkSubmission gradeSubmission(String submissionId, HomeworkDto.GradeRequest request) {
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));
        if (request.getStatus() != null) {
            submission.setStatus(HomeworkStatus.valueOf(request.getStatus()));
        }
        return submissionRepository.save(submission);
    }

    public HomeworkDto.Response toResponse(Homework hw) {
        return HomeworkDto.Response.builder()
                .id(hw.getId())
                .title(hw.getTitle())
                .description(hw.getDescription())
                .dueDate(hw.getDueDate())
                .status(hw.getStatus() != null ? hw.getStatus().name() : null)
                .classId(hw.getClassId())
                .className(hw.getSchoolClass() != null ? hw.getSchoolClass().getName() : null)
                .subjectId(hw.getSubjectId())
                .subjectName(hw.getSubject() != null ? hw.getSubject().getName() : null)
                .createdAt(hw.getCreatedAt())
                .updatedAt(hw.getUpdatedAt())
                .build();
    }

    public HomeworkDto.SubmissionResponse toSubmissionResponse(HomeworkSubmission sub) {
        return HomeworkDto.SubmissionResponse.builder()
                .id(sub.getId())
                .homeworkId(sub.getHomeworkId())
                .studentId(sub.getStudentId())
                .studentName(sub.getStudent() != null ? sub.getStudent().getName() : null)
                .status(sub.getStatus() != null ? sub.getStatus().name() : null)
                .submittedAt(sub.getSubmittedAt())
                .build();
    }
}
