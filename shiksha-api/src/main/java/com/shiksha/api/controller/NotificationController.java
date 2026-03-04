package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.NotificationDto;
import com.shiksha.api.entity.Notification;
import com.shiksha.api.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get notifications for a student")
    public ResponseEntity<ApiResponse<List<NotificationDto.Response>>> getByStudent(
            @RequestParam String studentId) {
        List<NotificationDto.Response> list = notificationService.getNotificationsByStudent(studentId)
                .stream().map(notificationService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count for a student")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@RequestParam String studentId) {
        long count = notificationService.getUnreadCount(studentId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping
    @Operation(summary = "Create a notification")
    public ResponseEntity<ApiResponse<NotificationDto.Response>> create(
            @Valid @RequestBody NotificationDto.CreateRequest request) {
        Notification notification = notificationService.createNotification(request);
        return ResponseEntity.ok(ApiResponse.success(notificationService.toResponse(notification), "Notification sent"));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read"));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for a student")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestParam String studentId) {
        notificationService.markAllAsRead(studentId);
        return ResponseEntity.ok(ApiResponse.success(null, "All marked as read"));
    }
}
