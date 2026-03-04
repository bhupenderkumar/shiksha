package com.shiksha.api.repository;

import com.shiksha.api.entity.ParentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentFeedbackRepository extends JpaRepository<ParentFeedback, String> {
    List<ParentFeedback> findByClassId(String classId);
    List<ParentFeedback> findByClassIdAndMonth(String classId, String month);

    @Query("SELECT p FROM ParentFeedback p WHERE LOWER(p.studentName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<ParentFeedback> searchByStudentName(@Param("name") String name);
}
