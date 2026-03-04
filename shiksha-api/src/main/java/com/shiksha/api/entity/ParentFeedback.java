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
@Table(name = "\"ParentFeedback\"", schema = "school")
public class ParentFeedback {

    @Id
    private String id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(nullable = false)
    private String month;

    @Column(name = "good_things")
    private String goodThings;

    @Column(name = "need_to_improve")
    private String needToImprove;

    @Column(name = "best_can_do")
    private String bestCanDo;

    @Column(name = "attendance_percentage")
    private Integer attendancePercentage;

    @Column(name = "student_photo_url")
    private String studentPhotoUrl;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", insertable = false, updatable = false)
    private SchoolClass schoolClass;
}
