package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.FeedbackDto;
import com.shiksha.api.dto.ParentFeedbackDto;
import com.shiksha.api.entity.Feedback;
import com.shiksha.api.entity.ParentFeedback;
import com.shiksha.api.entity.ParentSubmittedFeedback;
import com.shiksha.api.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Feedback management endpoints")
public class FeedbackController {

    private final FeedbackService feedbackService;

    // User Feedback endpoints
    @GetMapping
    @Operation(summary = "Get all feedback")
    public ResponseEntity<ApiResponse<List<FeedbackDto.Response>>> getAll() {
        List<FeedbackDto.Response> list = feedbackService.getAllFeedback()
                .stream().map(feedbackService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get feedback by ID")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> getById(@PathVariable Long id) {
        FeedbackDto.Response response = feedbackService.toResponse(feedbackService.getFeedbackById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create feedback")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> create(
            @Valid @RequestBody FeedbackDto.CreateRequest request) {
        Feedback feedback = feedbackService.createFeedback(request);
        return ResponseEntity.ok(ApiResponse.success(feedbackService.toResponse(feedback), "Feedback submitted"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update feedback status")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Feedback feedback = feedbackService.updateFeedbackStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(feedbackService.toResponse(feedback), "Status updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feedback")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Feedback deleted"));
    }

    // Parent Feedback Form endpoints
    @GetMapping("/parent-forms")
    @Operation(summary = "Get all parent feedback forms")
    public ResponseEntity<ApiResponse<List<ParentFeedbackDto.Response>>> getParentForms() {
        List<ParentFeedbackDto.Response> list = feedbackService.getAllParentFeedbackForms()
                .stream().map(feedbackService::toParentFeedbackResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/parent-forms/{id}")
    @Operation(summary = "Get parent feedback form by ID")
    public ResponseEntity<ApiResponse<ParentFeedbackDto.Response>> getParentForm(
            @PathVariable String id) {
        ParentFeedbackDto.Response response = feedbackService.toParentFeedbackResponse(
                feedbackService.getParentFeedbackById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/parent-forms")
    @Operation(summary = "Create a parent feedback form")
    public ResponseEntity<ApiResponse<ParentFeedbackDto.Response>> createParentForm(
            @Valid @RequestBody ParentFeedbackDto.CreateRequest request) {
        ParentFeedback form = feedbackService.createParentFeedbackForm(request);
        return ResponseEntity.ok(ApiResponse.success(feedbackService.toParentFeedbackResponse(form), "Form created"));
    }

    // Parent Feedback Submission endpoints
    @GetMapping("/parent-forms/{formId}/submissions")
    @Operation(summary = "Get submissions for a parent feedback form")
    public ResponseEntity<ApiResponse<List<ParentFeedbackDto.SubmittedResponse>>> getSubmissions(
            @PathVariable String formId) {
        List<ParentFeedbackDto.SubmittedResponse> list = feedbackService.getSubmissionsByForm(formId)
                .stream().map(feedbackService::toSubmittedResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/parent-forms/{formId}/submissions")
    @Operation(summary = "Submit parent feedback")
    public ResponseEntity<ApiResponse<ParentFeedbackDto.SubmittedResponse>> submitParentFeedback(
            @PathVariable String formId,
            @Valid @RequestBody ParentFeedbackDto.SubmitRequest request) {
        ParentSubmittedFeedback submission = feedbackService.submitParentFeedback(formId, request);
        return ResponseEntity.ok(ApiResponse.success(feedbackService.toSubmittedResponse(submission), "Feedback submitted"));
    }
}
