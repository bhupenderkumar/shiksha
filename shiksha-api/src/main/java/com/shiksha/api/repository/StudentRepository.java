package com.shiksha.api.repository;

import com.shiksha.api.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    List<Student> findByClassId(String classId);

    Page<Student> findByClassId(String classId, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> searchByName(@Param("name") String name);

    @Query("SELECT s FROM Student s WHERE s.admissionNumber = :admissionNumber")
    java.util.Optional<Student> findByAdmissionNumber(@Param("admissionNumber") String admissionNumber);

    @Query("SELECT s FROM Student s WHERE SUBSTRING(s.dateOfBirth, 6, 5) = :monthDay")
    List<Student> findByBirthday(@Param("monthDay") String monthDay);

    long countByClassId(String classId);
}
