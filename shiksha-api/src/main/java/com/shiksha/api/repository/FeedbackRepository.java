package com.shiksha.api.repository;

import com.shiksha.api.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUserId(String userId);
    List<Feedback> findByStatus(String status);
    List<Feedback> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByStatus(String status);
}
