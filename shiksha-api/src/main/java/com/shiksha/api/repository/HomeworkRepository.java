package com.shiksha.api.repository;

import com.shiksha.api.entity.Homework;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, String> {
    List<Homework> findByClassId(String classId);
    Page<Homework> findByClassId(String classId, Pageable pageable);
    Page<Homework> findByClassIdOrderByCreatedAtDesc(String classId, Pageable pageable);
    List<Homework> findBySubjectId(String subjectId);

    @Query("SELECT h FROM Homework h WHERE h.classId = :classId AND h.status = :status")
    List<Homework> findByClassIdAndStatus(@Param("classId") String classId, @Param("status") String status);

    @Query("SELECT h FROM Homework h WHERE h.dueDate < :date AND h.status = com.shiksha.api.common.enums.HomeworkStatus.PENDING")
    List<Homework> findOverdue(@Param("date") String date);

    long countByStatus(com.shiksha.api.common.enums.HomeworkStatus status);
}
