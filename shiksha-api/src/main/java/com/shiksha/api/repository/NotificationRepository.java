package com.shiksha.api.repository;

import com.shiksha.api.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    Page<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId, Pageable pageable);
    Page<Notification> findByClassIdOrderByCreatedAtDesc(String classId, Pageable pageable);
    List<Notification> findByStudentIdAndIsReadFalse(String studentId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.studentId = :studentId AND n.isRead = false")
    long countUnreadByStudentId(@Param("studentId") String studentId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.studentId = :studentId AND n.isRead = false")
    void markAllAsReadByStudentId(@Param("studentId") String studentId);
}
