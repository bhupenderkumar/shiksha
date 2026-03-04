package com.shiksha.api.repository;

import com.shiksha.api.entity.BirthdayMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BirthdayMessageRepository extends JpaRepository<BirthdayMessage, String> {
    List<BirthdayMessage> findByStudentId(String studentId);
}
