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
@Table(name = "\"Settings\"", schema = "school")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column
    private String address;

    @Column
    private String phone;

    @Column
    private String email;

    @Column
    private String website;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;
}
