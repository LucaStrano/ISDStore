package com.isdstore.cart;

import com.isdstore.common.dto.CartDTO;
import com.isdstore.common.dto.CartItemDTO;
import com.isdstore.common.dto.CartViewDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.isdstore.common.repo.ProductRepository;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);

    private final CartService cartService;
    private final ProductRepository productRepository;

    public CartController(CartService cartService, ProductRepository productRepository) {
        this.cartService = cartService;
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        UUID userId = currentUserId();
        log.info("GET /api/cart for user={}", userId);
        CartViewDTO view = cartService.getCartView(userId);
        log.info("Responding cart view for user={} items={} totalCents={}", userId, view.getItems().size(), view.getTotalCents());
        return ResponseEntity.ok(view);
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody CartItemDTO item) {
        if (item.getProductId() == null || item.getQuantity() == null) {
            return ResponseEntity.badRequest().body("productId and quantity are required");
        }
        if (!productRepository.existsById(item.getProductId())) {
            return ResponseEntity.badRequest().body("Product not found");
        }
        UUID userId = currentUserId();
        log.info("POST /api/cart/items user={} productId={} quantity={}", userId, item.getProductId(), item.getQuantity());
        CartDTO cart = cartService.addItem(userId, item.getProductId(), item.getQuantity());
        log.info("Item added. user={} newItemsCount={} totalCents={}", userId, cart.getItems().size(), cart.getTotalCents());
        CartViewDTO view = cartService.getCartView(userId);
        return ResponseEntity.ok(view);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@PathVariable String productId) {
        try {
            UUID pid = UUID.fromString(productId);
            UUID userId = currentUserId();
            log.info("DELETE /api/cart/items/{} user={}", pid, userId);
            CartDTO cart = cartService.removeItem(userId, pid);
            log.info("Item removed. user={} newItemsCount={} totalCents={}", userId, cart.getItems().size(), cart.getTotalCents());
            CartViewDTO view = cartService.getCartView(userId);
            return ResponseEntity.ok(view);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid productId");
        }
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("Unauthenticated");
        }
        String principal = auth.getPrincipal().toString();
        try {
            return UUID.fromString(principal);
        } catch (Exception e) {
            log.error("Principal is not a UUID: {}", principal);
            throw new IllegalStateException("Invalid principal");
        }
    }
}
