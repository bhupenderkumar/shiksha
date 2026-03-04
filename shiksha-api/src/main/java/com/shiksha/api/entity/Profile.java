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
@Table(name = "\"Profile\"", schema = "school")
public class Profile {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false)
    private String role;

    @Column(name = "avatar_url")
    private String avatarUrl;
}
