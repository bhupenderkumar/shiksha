package com.shiksha.api.repository;

import com.shiksha.api.entity.ProspectiveStudent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProspectiveStudentRepository extends JpaRepository<ProspectiveStudent, String> {
    Page<ProspectiveStudent> findBySchoolId(String schoolId, Pageable pageable);
    List<ProspectiveStudent> findBySchoolId(String schoolId);

    @Query("SELECT p FROM ProspectiveStudent p WHERE p.status = :status")
    List<ProspectiveStudent> findByStatus(@Param("status") com.shiksha.api.common.enums.EnquiryStatus status);

    List<ProspectiveStudent> findBySchoolIdAndStatus(String schoolId, com.shiksha.api.common.enums.EnquiryStatus status);

    @Query("SELECT p FROM ProspectiveStudent p WHERE LOWER(p.studentName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<ProspectiveStudent> searchByStudentName(@Param("name") String name);

    long countByStatus(com.shiksha.api.common.enums.EnquiryStatus status);
}
