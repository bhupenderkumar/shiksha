package com.shiksha.api.repository;

import com.shiksha.api.entity.InteractiveAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteractiveAssignmentRepository extends JpaRepository<InteractiveAssignment, Long> {
    List<InteractiveAssignment> findByClassId(String classId);
    Optional<InteractiveAssignment> findByShareableLink(String shareableLink);
}
