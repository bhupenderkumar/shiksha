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
@Table(name = "birthday_messages", schema = "school")
public class BirthdayMessage {

    @Id
    private String id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "sent_to", nullable = false)
    private String sentTo;

    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "sent_at")
    private String sentAt;

    @Column(name = "created_at")
    private String createdAt;
}
