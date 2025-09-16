package com.isdstore.common.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ProductDTO {
    private UUID id;
    private String title;
    private String description;
    private Integer priceCents;
    private String image;
    private Integer stock;
}
