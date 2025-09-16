package com.isdstore.common.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "carts")
@Getter
@Setter
public class Cart {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    // Serialized LOB of items as JSON string (simple placeholder)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String items;

    @UpdateTimestamp
    private Instant updatedAt;
}
