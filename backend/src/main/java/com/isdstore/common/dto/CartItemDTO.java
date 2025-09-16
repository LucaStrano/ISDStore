package com.isdstore.common.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CartItemDTO {
    private UUID productId;
    private Integer quantity;
}
