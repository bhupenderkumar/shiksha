package com.shiksha.api.repository;

import com.shiksha.api.entity.ParentSubmittedFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentSubmittedFeedbackRepository extends JpaRepository<ParentSubmittedFeedback, String> {
    List<ParentSubmittedFeedback> findByClassId(String classId);
    List<ParentSubmittedFeedback> findByStatus(String status);
}
