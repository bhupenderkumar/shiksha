package com.shiksha.api.repository;

import com.shiksha.api.entity.Classwork;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassworkRepository extends JpaRepository<Classwork, String> {
    List<Classwork> findByClassId(String classId);
    Page<Classwork> findByClassId(String classId, Pageable pageable);
    Page<Classwork> findByClassIdOrderByCreatedAtDesc(String classId, Pageable pageable);
}
