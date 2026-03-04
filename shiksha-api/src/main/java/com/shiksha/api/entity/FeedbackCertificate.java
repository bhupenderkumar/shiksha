package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"FeedbackCertificate\"", schema = "school")
public class FeedbackCertificate {

    @Id
    private String id;

    @Column(name = "feedback_id", nullable = false)
    private String feedbackId;

    @Column(name = "certificate_url")
    private String certificateUrl;

    @Column(name = "download_count")
    @Builder.Default
    private Integer downloadCount = 0;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id", insertable = false, updatable = false)
    private ParentFeedback parentFeedback;
}
