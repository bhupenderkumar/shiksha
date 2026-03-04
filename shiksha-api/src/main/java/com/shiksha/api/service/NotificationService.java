package com.shiksha.api.service;

import com.shiksha.api.common.enums.NotificationType;
import com.shiksha.api.dto.NotificationDto;
import com.shiksha.api.entity.Notification;
import com.shiksha.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Page<Notification> getByStudentId(String studentId, Pageable pageable) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
    }

    public List<Notification> getNotificationsByStudent(String studentId) {
        return notificationRepository.findByStudentIdAndIsReadFalse(studentId);
    }

    public Page<Notification> getByClassId(String classId, Pageable pageable) {
        return notificationRepository.findByClassIdOrderByCreatedAtDesc(classId, pageable);
    }

    public List<Notification> getUnreadByStudentId(String studentId) {
        return notificationRepository.findByStudentIdAndIsReadFalse(studentId);
    }

    public long getUnreadCount(String studentId) {
        return notificationRepository.countUnreadByStudentId(studentId);
    }

    @Transactional
    public Notification create(NotificationDto.CreateRequest request) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(NotificationType.valueOf(request.getType()))
                .isRead(false)
                .studentId(request.getStudentId())
                .classId(request.getClassId())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        try {
            if (request.getStudentId() != null) {
                messagingTemplate.convertAndSendToUser(
                        request.getStudentId(),
                        "/queue/notifications",
                        toResponse(saved));
            }
            if (request.getClassId() != null) {
                messagingTemplate.convertAndSend(
                        "/topic/class/" + request.getClassId() + "/notifications",
                        toResponse(saved));
            }
        } catch (Exception ex) {
            log.warn("Failed to send WebSocket notification: {}", ex.getMessage());
        }

        return saved;
    }

    @Transactional
    public Notification createNotification(NotificationDto.CreateRequest request) {
        return create(request);
    }

    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            n.setUpdatedAt(Instant.now().toString());
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String studentId) {
        notificationRepository.markAllAsReadByStudentId(studentId);
    }

    @Transactional
    public void delete(String id) {
        notificationRepository.deleteById(id);
    }

    public NotificationDto.Response toResponse(Notification n) {
        return NotificationDto.Response.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : null)
                .isRead(n.isRead())
                .studentId(n.getStudentId())
                .classId(n.getClassId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
