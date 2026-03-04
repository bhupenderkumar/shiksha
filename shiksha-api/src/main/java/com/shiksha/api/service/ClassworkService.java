package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.ClassworkDto;
import com.shiksha.api.entity.Classwork;
import com.shiksha.api.repository.ClassworkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassworkService {

    private final ClassworkRepository classworkRepository;

    public List<Classwork> getByClass(String classId) {
        return classworkRepository.findByClassId(classId);
    }

    public List<Classwork> getClassworkByClass(String classId) {
        return getByClass(classId);
    }

    public Page<Classwork> getByClassPaged(String classId, Pageable pageable) {
        return classworkRepository.findByClassIdOrderByCreatedAtDesc(classId, pageable);
    }

    public Classwork getById(String id) {
        return classworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classwork not found with id: " + id));
    }

    public Classwork getClassworkById(String id) {
        return getById(id);
    }

    @Transactional
    public Classwork create(ClassworkDto.CreateRequest request) {
        Classwork classwork = Classwork.builder()
                .id(UUID.randomUUID().toString())
                .title(request.getTitle())
                .description(request.getDescription())
                .classId(request.getClassId())
                .date(request.getDate())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return classworkRepository.save(classwork);
    }

    @Transactional
    public Classwork createClasswork(ClassworkDto.CreateRequest request) {
        return create(request);
    }

    @Transactional
    public Classwork update(String id, ClassworkDto.UpdateRequest request) {
        Classwork classwork = getById(id);
        if (request.getTitle() != null) classwork.setTitle(request.getTitle());
        if (request.getDescription() != null) classwork.setDescription(request.getDescription());
        if (request.getDate() != null) classwork.setDate(request.getDate());
        if (request.getClassId() != null) classwork.setClassId(request.getClassId());
        classwork.setUpdatedAt(Instant.now().toString());
        return classworkRepository.save(classwork);
    }

    @Transactional
    public Classwork updateClasswork(String id, ClassworkDto.UpdateRequest request) {
        return update(id, request);
    }

    @Transactional
    public void delete(String id) {
        Classwork classwork = getById(id);
        classworkRepository.delete(classwork);
    }

    @Transactional
    public void deleteClasswork(String id) {
        delete(id);
    }

    public ClassworkDto.Response toResponse(Classwork cw) {
        return ClassworkDto.Response.builder()
                .id(cw.getId())
                .title(cw.getTitle())
                .description(cw.getDescription())
                .date(cw.getDate())
                .classId(cw.getClassId())
                .className(cw.getSchoolClass() != null ? cw.getSchoolClass().getName() : null)
                .createdAt(cw.getCreatedAt())
                .updatedAt(cw.getUpdatedAt())
                .build();
    }
}
