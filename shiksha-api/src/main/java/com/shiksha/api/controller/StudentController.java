package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.StudentDto;
import com.shiksha.api.entity.Student;
import com.shiksha.api.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @Operation(summary = "Get students by class")
    public ResponseEntity<ApiResponse<List<StudentDto.Response>>> getByClass(
            @RequestParam String classId) {
        List<StudentDto.Response> students = studentService.getStudentsByClass(classId)
                .stream().map(studentService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get students by class (paginated)")
    public ResponseEntity<ApiResponse<Page<StudentDto.Response>>> getByClassPaged(
            @RequestParam String classId, Pageable pageable) {
        Page<StudentDto.Response> page = studentService.getStudentsByClassPaged(classId, pageable)
                .map(studentService::toResponse);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID")
    public ResponseEntity<ApiResponse<StudentDto.Response>> getById(@PathVariable String id) {
        StudentDto.Response response = studentService.toResponse(studentService.getStudentById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search students by name")
    public ResponseEntity<ApiResponse<List<StudentDto.Response>>> search(@RequestParam String name) {
        List<StudentDto.Response> results = studentService.searchStudents(name)
                .stream().map(studentService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping
    @Operation(summary = "Create a new student")
    public ResponseEntity<ApiResponse<StudentDto.Response>> create(
            @Valid @RequestBody StudentDto.CreateRequest request) {
        Student student = studentService.createStudent(request);
        return ResponseEntity.ok(ApiResponse.success(studentService.toResponse(student), "Student created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a student")
    public ResponseEntity<ApiResponse<StudentDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody StudentDto.UpdateRequest request) {
        Student student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.success(studentService.toResponse(student), "Student updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a student")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Student deleted"));
    }

    @GetMapping("/birthdays")
    @Operation(summary = "Get upcoming birthdays")
    public ResponseEntity<ApiResponse<List<StudentDto.Response>>> getBirthdays(
            @RequestParam String monthDay) {
        List<StudentDto.Response> results = studentService.getUpcomingBirthdays(monthDay)
                .stream().map(studentService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
