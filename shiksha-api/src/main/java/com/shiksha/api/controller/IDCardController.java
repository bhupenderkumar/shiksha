package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.IDCardDto;
import com.shiksha.api.entity.IDCard;
import com.shiksha.api.service.IDCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/id-cards")
@RequiredArgsConstructor
@Tag(name = "ID Cards", description = "Student ID card management endpoints")
public class IDCardController {

    private final IDCardService idCardService;

    @GetMapping("/class/{classId}")
    @Operation(summary = "Get ID cards by class")
    public ResponseEntity<ApiResponse<List<IDCardDto.Response>>> getByClass(
            @PathVariable String classId) {
        List<IDCardDto.Response> list = idCardService.getIDCardsByClass(classId)
                .stream().map(idCardService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ID card by ID")
    public ResponseEntity<ApiResponse<IDCardDto.Response>> getById(@PathVariable String id) {
        IDCardDto.Response response = idCardService.toResponse(idCardService.getIDCardById(id));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get ID card by student ID")
    public ResponseEntity<ApiResponse<IDCardDto.Response>> getByStudent(@PathVariable String studentId) {
        IDCardDto.Response response = idCardService.toResponse(idCardService.getIDCardByStudent(studentId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create an ID card")
    public ResponseEntity<ApiResponse<IDCardDto.Response>> create(
            @Valid @RequestBody IDCardDto.CreateRequest request) {
        IDCard card = idCardService.createIDCard(request);
        return ResponseEntity.ok(ApiResponse.success(idCardService.toResponse(card), "ID card created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an ID card")
    public ResponseEntity<ApiResponse<IDCardDto.Response>> update(
            @PathVariable String id,
            @Valid @RequestBody IDCardDto.UpdateRequest request) {
        IDCard card = idCardService.updateIDCard(id, request);
        return ResponseEntity.ok(ApiResponse.success(idCardService.toResponse(card), "ID card updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an ID card")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        idCardService.deleteIDCard(id);
        return ResponseEntity.ok(ApiResponse.success(null, "ID card deleted"));
    }

    @PostMapping("/{id}/download")
    @Operation(summary = "Increment download count")
    public ResponseEntity<ApiResponse<Void>> incrementDownload(@PathVariable String id) {
        idCardService.incrementDownloadCount(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Download count updated"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search ID cards by student name")
    public ResponseEntity<ApiResponse<List<IDCardDto.Response>>> search(@RequestParam String name) {
        List<IDCardDto.Response> list = idCardService.searchByStudentName(name)
                .stream().map(idCardService::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
