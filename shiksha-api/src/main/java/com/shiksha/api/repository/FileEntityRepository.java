package com.shiksha.api.repository;

import com.shiksha.api.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileEntityRepository extends JpaRepository<FileEntity, String> {
    List<FileEntity> findByHomeworkId(String homeworkId);
    List<FileEntity> findByClassworkId(String classworkId);
    List<FileEntity> findByFeeId(String feeId);
    List<FileEntity> findByInteractiveAssignmentId(Long interactiveAssignmentId);
}
