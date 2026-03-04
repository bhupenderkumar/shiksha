package com.shiksha.api.repository;

import com.shiksha.api.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, String> {
    List<Fee> findByStudentId(String studentId);

    @Query("SELECT f FROM Fee f WHERE f.studentId = :studentId AND f.status = :status")
    List<Fee> findByStudentIdAndStatus(@Param("studentId") String studentId, @Param("status") com.shiksha.api.common.enums.FeeStatus status);

    @Query("SELECT f FROM Fee f WHERE f.studentId = :studentId AND (f.status = com.shiksha.api.common.enums.FeeStatus.PENDING OR f.status = com.shiksha.api.common.enums.FeeStatus.OVERDUE)")
    List<Fee> findPendingByStudent(@Param("studentId") String studentId);

    @Query("SELECT f FROM Fee f WHERE f.dueDate < :today AND f.status = com.shiksha.api.common.enums.FeeStatus.PENDING")
    List<Fee> findOverdueFees(@Param("today") String today);

    long countByStatus(com.shiksha.api.common.enums.FeeStatus status);
}
