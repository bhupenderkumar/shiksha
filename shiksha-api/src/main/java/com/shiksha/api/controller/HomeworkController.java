package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.HomeworkDto;
import com.shiksha.api.entity.Homework;
import com.shiksha.api.entity.HomeworkSubmission;
import com.shiksha.api.service.HomeworkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/homework")
@RequiredArgsConstructor
@Tag(name = "Homework", description = "Homework management endpoints")
public class HomeworkController {

    private final HomeworkService homeworkService;

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get homework by class")
    public ResponseEntity<ApiResponse<List<HomeworkDto.Response>>> getByClass(
            @PathVariable String classId) {
        List<HomeworkDto.Response> list = homeworkService.getHomeworkByClass(classId)
                .stream().map(homeworkService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get homework by ID")
    public ResponseEntity<ApiResponse<HomeworkDto.Response>> getById(@PathVariable String id) {
        HomeworkDto.Response response = homeworkService.toResponse(homeworkService.getHomeworkById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create homework")
    public ResponseEntity<ApiResponse<HomeworkDto.Response>> create(
            @Valid @RequestBody HomeworkDto.CreateRequest request) {
        Homework hw = homeworkService.createHomework(request);
        return ResponseEntity.ok(ApiResponse.success(homeworkService.toResponse(hw), "Homework created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update homework")
    public ResponseEntity<ApiResponse<HomeworkDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody HomeworkDto.UpdateRequest request) {
        Homework hw = homeworkService.updateHomework(id, request);
        return ResponseEntity.ok(ApiResponse.success(homeworkService.toResponse(hw), "Homework updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete homework")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        homeworkService.deleteHomework(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Homework deleted"));
    }

    // Submission endpoints
    @GetMapping("/{homeworkId}/submissions")
    @Operation(summary = "Get submissions for homework")
    public ResponseEntity<ApiResponse<List<HomeworkDto.SubmissionResponse>>> getSubmissions(
            @PathVariable String homeworkId) {
        List<HomeworkDto.SubmissionResponse> list = homeworkService.getSubmissions(homeworkId)
                .stream().map(homeworkService::toSubmissionResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{homeworkId}/submissions")
    @Operation(summary = "Submit homework")
    public ResponseEntity<ApiResponse<HomeworkDto.SubmissionResponse>> submitHomework(
            @PathVariable String homeworkId,
            @Valid @RequestBody HomeworkDto.SubmitRequest request) {
        HomeworkSubmission sub = homeworkService.submitHomework(homeworkId, request);
        return ResponseEntity.ok(ApiResponse.success(homeworkService.toSubmissionResponse(sub), "Homework submitted"));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @Operation(summary = "Grade a homework submission")
    public ResponseEntity<ApiResponse<HomeworkDto.SubmissionResponse>> gradeSubmission(
            @PathVariable String submissionId,
            @Valid @RequestBody HomeworkDto.GradeRequest request) {
        HomeworkSubmission sub = homeworkService.gradeSubmission(submissionId, request);
        return ResponseEntity.ok(ApiResponse.success(homeworkService.toSubmissionResponse(sub), "Submission graded"));
    }
}
