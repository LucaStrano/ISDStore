package com.isdstore.products;

import com.isdstore.common.dto.ProductDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")

public class ProductController {

    @GetMapping
    public List<ProductDTO> list(@RequestParam(name = "q", required = false) String q) {
        // TODO list all products (Use ProductRepository)
        return Collections.emptyList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> get(@PathVariable UUID id) {
        // TODO fetch product with id (Use ProductRepository)
        return ResponseEntity.ofNullable(null);
    }
}
