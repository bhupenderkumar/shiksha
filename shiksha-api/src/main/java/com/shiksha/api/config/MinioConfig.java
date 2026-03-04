package com.shiksha.api.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
public class MinioConfig {

    @Value("${app.minio.endpoint}")
    private String endpoint;

    @Value("${app.minio.access-key}")
    private String accessKey;

    @Value("${app.minio.secret-key}")
    private String secretKey;

    @Value("${app.minio.bucket-name}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        try {
            // Create a trust-all OkHttpClient to avoid cacert.pem issues
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                        public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                    }
            };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            OkHttpClient httpClient = new OkHttpClient.Builder()
                    .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                    .hostnameVerifier((hostname, session) -> true)
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build();

            MinioClient client = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .httpClient(httpClient)
                    .build();

            try {
                boolean bucketExists = client.bucketExists(
                        BucketExistsArgs.builder().bucket(bucketName).build());
                if (!bucketExists) {
                    client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                    log.info("Created MinIO bucket: {}", bucketName);
                }
            } catch (Exception e) {
                log.warn("Could not check/create MinIO bucket '{}': {}", bucketName, e.getMessage());
            }

            return client;
        } catch (Exception e) {
            log.error("Failed to create MinIO client: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize MinIO client", e);
        }
    }
}
