package com.isdstore.common.dto;

import lombok.Data;

@Data
public class CartViewItemDTO {
    private ProductDTO product;
    private Integer quantity;
    private Integer itemTotalCents;
}
