package com.isdstore.common.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class OrderDTO {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private List<OrderItemViewDTO> items;
    private Integer totalCents;
    private String status;
    private Instant createdAt;
}
