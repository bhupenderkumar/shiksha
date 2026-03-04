package com.shiksha.api.service;

import com.shiksha.api.common.exception.BadRequestException;
import com.shiksha.api.dto.FileDto;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MinioClient minioClient;

    @Value("${app.minio.bucket-name}")
    private String bucket;

    @Value("${app.minio.endpoint}")
    private String minioUrl;

    /**
     * Upload a file to MinIO storage.
     */
    public FileDto.UploadResponse uploadFile(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                originalFilename = "file";
            }

            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            }

            String objectName = folder + "/" + UUID.randomUUID() + extension;

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            String url = minioUrl + "/" + bucket + "/" + objectName;

            FileDto.UploadResponse response = new FileDto.UploadResponse();
            response.setFileName(originalFilename);
            response.setFileUrl(url);
            response.setObjectName(objectName);
            response.setContentType(file.getContentType());
            response.setSize(file.getSize());

            log.info("File uploaded: {} -> {}", originalFilename, objectName);
            return response;

        } catch (Exception e) {
            log.error("Failed to upload file", e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Download a file from MinIO storage.
     */
    public InputStream downloadFile(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("Failed to download file: {}", objectName, e);
            throw new BadRequestException("Failed to download file: " + e.getMessage());
        }
    }

    /**
     * Generate a pre-signed URL for temporary file access.
     */
    public String getSignedUrl(String objectName, int expiryMinutes) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucket)
                    .object(objectName)
                    .expiry(expiryMinutes, TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            log.error("Failed to generate signed URL for: {}", objectName, e);
            throw new BadRequestException("Failed to generate signed URL: " + e.getMessage());
        }
    }

    /**
     * Delete a file from MinIO storage.
     */
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
            log.info("File deleted: {}", objectName);
        } catch (Exception e) {
            log.error("Failed to delete file: {}", objectName, e);
            throw new BadRequestException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Check if a file exists in MinIO storage.
     */
    public boolean fileExists(String objectName) {
        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectName)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
