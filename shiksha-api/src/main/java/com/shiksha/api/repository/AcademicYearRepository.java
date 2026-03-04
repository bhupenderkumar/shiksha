package com.shiksha.api.repository;

import com.shiksha.api.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, String> {
    Optional<AcademicYear> findByStatus(String status);
}
