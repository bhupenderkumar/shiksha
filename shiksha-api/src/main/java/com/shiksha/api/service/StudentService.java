package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.StudentDto;
import com.shiksha.api.entity.Student;
import com.shiksha.api.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
public class StudentService {

    private final StudentRepository studentRepository;

    @Cacheable(value = "students", key = "#classId")
    public List<Student> getStudentsByClass(String classId) {
        return studentRepository.findByClassId(classId);
    }

    public Page<Student> getStudentsByClassPaged(String classId, Pageable pageable) {
        return studentRepository.findByClassId(classId, pageable);
    }

    public Student getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public List<Student> searchStudents(String name) {
        return studentRepository.searchByName(name);
    }

    @Transactional
    @CacheEvict(value = "students", allEntries = true)
    public Student createStudent(StudentDto.CreateRequest request) {
        Student student = Student.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .admissionNumber(request.getAdmissionNumber())
                .classId(request.getClassId())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .address(request.getAddress())
                .contactNumber(request.getContactNumber())
                .parentName(request.getParentName())
                .parentContact(request.getParentContact())
                .parentEmail(request.getParentEmail())
                .createdAt(Instant.now().toString())
                .updatedAt(Instant.now().toString())
                .build();
        return studentRepository.save(student);
    }

    @Transactional
    @CacheEvict(value = "students", allEntries = true)
    public Student updateStudent(String id, StudentDto.UpdateRequest request) {
        Student student = getStudentById(id);
        if (request.getName() != null) student.setName(request.getName());
        if (request.getClassId() != null) student.setClassId(request.getClassId());
        if (request.getDateOfBirth() != null) student.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) student.setGender(request.getGender());
        if (request.getBloodGroup() != null) student.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null) student.setAddress(request.getAddress());
        if (request.getContactNumber() != null) student.setContactNumber(request.getContactNumber());
        if (request.getParentName() != null) student.setParentName(request.getParentName());
        if (request.getParentContact() != null) student.setParentContact(request.getParentContact());
        if (request.getParentEmail() != null) student.setParentEmail(request.getParentEmail());
        student.setUpdatedAt(Instant.now().toString());
        return studentRepository.save(student);
    }

    @Transactional
    @CacheEvict(value = "students", allEntries = true)
    public void deleteStudent(String id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    public List<Student> getUpcomingBirthdays(String monthDay) {
        return studentRepository.findByBirthday(monthDay);
    }

    public long countStudentsByClass(String classId) {
        return studentRepository.countByClassId(classId);
    }

    public StudentDto.Response toResponse(Student student) {
        return StudentDto.Response.builder()
                .id(student.getId())
                .name(student.getName())
                .admissionNumber(student.getAdmissionNumber())
                .classId(student.getClassId())
                .className(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null)
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .bloodGroup(student.getBloodGroup())
                .address(student.getAddress())
                .contactNumber(student.getContactNumber())
                .parentName(student.getParentName())
                .parentContact(student.getParentContact())
                .parentEmail(student.getParentEmail())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
