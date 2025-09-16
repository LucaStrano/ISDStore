package com.isdstore.cart;

import com.isdstore.common.dto.CartItemDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping
    public ResponseEntity<?> getCart() {
        // TODO get cart from Redis
        return ResponseEntity.ok("cart-stub");
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody CartItemDTO item) {
        // TODO add item to cart
        return ResponseEntity.ok("added-stub");
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@PathVariable String productId) {
        // TODO remove
        return ResponseEntity.ok("removed-stub");
    }
}
