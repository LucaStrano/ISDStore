package com.isdstore.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String items; // JSON serialized list of items

    @Column(nullable = false)
    private Integer totalCents;

    @Column(nullable = false)
    private String status; // completed

    @CreationTimestamp
    private Instant createdAt;
}
