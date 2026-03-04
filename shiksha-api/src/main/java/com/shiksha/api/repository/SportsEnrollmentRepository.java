package com.shiksha.api.repository;

import com.shiksha.api.entity.SportsEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportsEnrollmentRepository extends JpaRepository<SportsEnrollment, String> {
    List<SportsEnrollment> findByClassId(String classId);
    List<SportsEnrollment> findByStatus(String status);
    List<SportsEnrollment> findByClassName(String className);
    List<SportsEnrollment> findByStudentName(String studentName);
}
