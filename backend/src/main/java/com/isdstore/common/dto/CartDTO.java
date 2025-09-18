package com.isdstore.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDTO {
    private List<CartItemDTO> items;
    private Integer totalCents;
}
