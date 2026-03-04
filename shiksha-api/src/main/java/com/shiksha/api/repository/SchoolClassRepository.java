package com.shiksha.api.repository;

import com.shiksha.api.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, String> {
    List<SchoolClass> findBySchoolId(String schoolId);
    List<SchoolClass> findBySchoolIdOrderByNameAsc(String schoolId);
    long countBySchoolId(String schoolId);
}
