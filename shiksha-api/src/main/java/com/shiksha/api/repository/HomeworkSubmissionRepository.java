package com.shiksha.api.repository;

import com.shiksha.api.entity.HomeworkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, String> {
    List<HomeworkSubmission> findByHomeworkId(String homeworkId);
    List<HomeworkSubmission> findByStudentId(String studentId);
    java.util.Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(String homeworkId, String studentId);
}
