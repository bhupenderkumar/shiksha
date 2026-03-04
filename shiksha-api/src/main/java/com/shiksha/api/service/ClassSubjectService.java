package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.entity.SchoolClass;
import com.shiksha.api.entity.Subject;
import com.shiksha.api.repository.SchoolClassRepository;
import com.shiksha.api.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassSubjectService {

    private final SchoolClassRepository classRepository;
    private final SubjectRepository subjectRepository;

    @Cacheable(value = "classes", key = "'all_' + #schoolId")
    public List<SchoolClass> getAllClasses(String schoolId) {
        return classRepository.findBySchoolIdOrderByNameAsc(schoolId);
    }

    public SchoolClass getClassById(String id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
    }

    public List<Subject> getSubjectsByClass(String classId) {
        return subjectRepository.findByClassId(classId);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }
}
