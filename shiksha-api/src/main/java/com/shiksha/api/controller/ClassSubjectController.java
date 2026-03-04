package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.entity.SchoolClass;
import com.shiksha.api.entity.Subject;
import com.shiksha.api.service.ClassSubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Classes & Subjects", description = "Class and subject endpoints")
public class ClassSubjectController {

    private final ClassSubjectService classSubjectService;

    @GetMapping("/classes")
    @Operation(summary = "Get all classes for a school")
    public ResponseEntity<ApiResponse<List<SchoolClass>>> getClasses(
            @RequestParam String schoolId) {
        List<SchoolClass> classes = classSubjectService.getAllClasses(schoolId);
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/classes/{classId}/subjects")
    @Operation(summary = "Get subjects for a class")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjects(
            @PathVariable String classId) {
        List<Subject> subjects = classSubjectService.getSubjectsByClass(classId);
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }
}
