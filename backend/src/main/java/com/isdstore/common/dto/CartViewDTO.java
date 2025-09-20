package com.isdstore.common.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartViewDTO {
    private List<CartViewItemDTO> items;
    private Integer totalCents;
}
