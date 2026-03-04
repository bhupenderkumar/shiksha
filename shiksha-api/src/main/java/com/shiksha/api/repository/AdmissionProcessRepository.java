package com.shiksha.api.repository;

import com.shiksha.api.entity.AdmissionProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdmissionProcessRepository extends JpaRepository<AdmissionProcess, String> {
    Optional<AdmissionProcess> findByProspectiveStudentId(String prospectiveStudentId);
}
