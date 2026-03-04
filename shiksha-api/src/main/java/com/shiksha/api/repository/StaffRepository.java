package com.shiksha.api.repository;

import com.shiksha.api.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, String> {
    List<Staff> findBySchoolId(String schoolId);
    Optional<Staff> findByUserId(String userId);
    Optional<Staff> findByEmail(String email);
}
