package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.ClassworkDto;
import com.shiksha.api.entity.Classwork;
import com.shiksha.api.service.ClassworkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/classwork")
@RequiredArgsConstructor
@Tag(name = "Classwork", description = "Classwork management endpoints")
public class ClassworkController {

    private final ClassworkService classworkService;

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get classwork by class")
    public ResponseEntity<ApiResponse<List<ClassworkDto.Response>>> getByClass(
            @PathVariable String classId) {
        List<ClassworkDto.Response> list = classworkService.getClassworkByClass(classId)
                .stream().map(classworkService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get classwork by ID")
    public ResponseEntity<ApiResponse<ClassworkDto.Response>> getById(@PathVariable String id) {
        ClassworkDto.Response response = classworkService.toResponse(classworkService.getClassworkById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create classwork")
    public ResponseEntity<ApiResponse<ClassworkDto.Response>> create(
            @Valid @RequestBody ClassworkDto.CreateRequest request) {
        Classwork cw = classworkService.createClasswork(request);
        return ResponseEntity.ok(ApiResponse.success(classworkService.toResponse(cw), "Classwork created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update classwork")
    public ResponseEntity<ApiResponse<ClassworkDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody ClassworkDto.UpdateRequest request) {
        Classwork cw = classworkService.updateClasswork(id, request);
        return ResponseEntity.ok(ApiResponse.success(classworkService.toResponse(cw), "Classwork updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete classwork")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        classworkService.deleteClasswork(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Classwork deleted"));
    }
}
