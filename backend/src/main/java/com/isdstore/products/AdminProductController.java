package com.isdstore.products;

import com.isdstore.common.dto.ProductDTO;
import com.isdstore.common.entity.Product;
import com.isdstore.common.repo.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private static final Logger log = LoggerFactory.getLogger(AdminProductController.class);

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductDTO dto) {
        // Basic validation (keep it simple)
        if (dto.getTitle() == null || dto.getTitle().isBlank()) return ResponseEntity.badRequest().body("Title is required");
        if (dto.getDescription() == null || dto.getDescription().isBlank()) return ResponseEntity.badRequest().body("Description is required");
        if (dto.getPriceCents() == null || dto.getPriceCents() < 0) return ResponseEntity.badRequest().body("priceCents must be >= 0");
        if (dto.getStock() == null || dto.getStock() < 0) return ResponseEntity.badRequest().body("stock must be >= 0");

        Product p = new Product();
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setPriceCents(dto.getPriceCents());
        p.setImage(dto.getImage());
        p.setStock(dto.getStock());

        Product saved = productRepository.save(p);
        log.info("Admin created product id={}", saved.getId());
        return ResponseEntity.ok(toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ProductDTO dto) {
        Optional<Product> existingOpt = productRepository.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        Product existing = existingOpt.get();
        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getPriceCents() != null && dto.getPriceCents() >= 0) existing.setPriceCents(dto.getPriceCents());
        if (dto.getImage() != null) existing.setImage(dto.getImage());
        if (dto.getStock() != null && dto.getStock() >= 0) existing.setStock(dto.getStock());

        Product saved = productRepository.save(existing);
        log.info("Admin updated product id={}", saved.getId());
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        log.info("Admin deleted product id={}", id);
        return ResponseEntity.noContent().build();
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
}
