package com.shiksha.api.controller;

import com.shiksha.api.common.dto.ApiResponse;
import com.shiksha.api.dto.FileDto;
import com.shiksha.api.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload and management endpoints")
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<FileDto.UploadResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String folder) {
        FileDto.UploadResponse response = fileStorageService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success(response, "File uploaded"));
    }

    @GetMapping("/download/{*objectName}")
    @Operation(summary = "Download a file")
    public ResponseEntity<InputStreamResource> download(@PathVariable String objectName) {
        InputStream stream = fileStorageService.downloadFile(objectName);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + getFileName(objectName) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/signed-url")
    @Operation(summary = "Get a pre-signed URL for a file")
    public ResponseEntity<ApiResponse<String>> getSignedUrl(
            @RequestParam String objectName,
            @RequestParam(defaultValue = "60") int expiryMinutes) {
        String url = fileStorageService.getSignedUrl(objectName, expiryMinutes);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @DeleteMapping
    @Operation(summary = "Delete a file")
    public ResponseEntity<ApiResponse<Void>> delete(@RequestParam String objectName) {
        fileStorageService.deleteFile(objectName);
        return ResponseEntity.ok(ApiResponse.success(null, "File deleted"));
    }

    private String getFileName(String objectName) {
        int lastSlash = objectName.lastIndexOf('/');
        return lastSlash >= 0 ? objectName.substring(lastSlash + 1) : objectName;
    }
}
