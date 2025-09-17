package com.isdstore.products;

import com.isdstore.common.dto.ProductDTO;
import com.isdstore.common.entity.Product;
import com.isdstore.common.repo.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")

public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDTO> list(@RequestParam(name = "q", required = false) String q) {
        List<Product> products = productRepository.findAll();
        // if (q != null && !q.isBlank()) {
        //     String needle = q.toLowerCase();
        //     products = products.stream()
        //             .filter(p -> containsIgnoreCase(p.getTitle(), needle) || containsIgnoreCase(p.getDescription(), needle))
        //             .collect(Collectors.toList());
        // }
        List<ProductDTO> result = products.stream().map(this::toDto).collect(Collectors.toList());
        log.info("Returning {} products", result.size());
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> get(@PathVariable("id") UUID id) {
        log.info("Fetching product {}", id);
        return productRepository.findById(id)
                .map(p -> {
                    log.info("Found product {}", id);
                    return ResponseEntity.ok(toDto(p));
                })
                .orElseGet(() -> {
                    log.warn("Product {} not found", id);
                    return ResponseEntity.notFound().build();
                });
    }

    private ProductDTO toDto(Product p) {
        ProductDTO dto = new ProductDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setPriceCents(p.getPriceCents());
        dto.setImage(p.getImage());
        dto.setStock(p.getStock());
        return dto;
    }

    // private boolean containsIgnoreCase(String haystack, String needleLower) {
    //     return haystack != null && haystack.toLowerCase().contains(needleLower);
    // }
}
