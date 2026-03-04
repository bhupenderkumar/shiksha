package com.shiksha.api.repository;

import com.shiksha.api.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, String> {
    List<Grievance> findByStudentId(String studentId);
}
