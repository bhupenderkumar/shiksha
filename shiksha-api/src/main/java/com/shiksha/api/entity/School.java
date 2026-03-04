package com.shiksha.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "\"School\"", schema = "school")
@EntityListeners(AuditingEntityListener.class)
public class School {

    @Id
    private String id;

    @Column(name = "\"schoolName\"", nullable = false)
    private String schoolName;

    @Column(name = "\"schoolAddress\"", nullable = false)
    private String schoolAddress;
}
