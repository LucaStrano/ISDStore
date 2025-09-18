package com.isdstore.cart;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.isdstore.common.dto.CartDTO;
import com.isdstore.common.dto.CartItemDTO;
import com.isdstore.common.entity.Product;
import com.isdstore.common.repo.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {
    private static final Logger log = LoggerFactory.getLogger(CartService.class);
    private static final String CART_KEY_PREFIX = "cart:"; // cart:{userId}
    private static final Duration CART_TTL = Duration.ofDays(7);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;

    public CartService(StringRedisTemplate redis, ProductRepository productRepository) {
        this.redis = redis;
        this.productRepository = productRepository;
        this.objectMapper = new ObjectMapper();
    }

    private String key(UUID userId) {
        return CART_KEY_PREFIX + userId;
    }

    public CartDTO getCart(UUID userId) {
        String k = key(userId);
        String json = redis.opsForValue().get(k);
        log.info("Load cart from Redis key={} user={}", k, userId);
        List<CartItemDTO> items;
        if (json == null || json.isBlank()) {
            log.info("Cart empty or missing for user={}", userId);
            items = new ArrayList<>();
        } else {
            try {
                items = objectMapper.readValue(json, new TypeReference<List<CartItemDTO>>() {});
                log.info("Parsed cart items={} for user={}", items.size(), userId);
            } catch (Exception e) {
                log.warn("Failed to parse cart JSON for user {}: {}", userId, e.getMessage());
                items = new ArrayList<>();
            }
        }
        int total = computeTotalCents(items);
        CartDTO dto = new CartDTO();
        dto.setItems(items);
        dto.setTotalCents(total);
        return dto;
    }

    public CartDTO addItem(UUID userId, UUID productId, int quantity) {
        if (quantity <= 0) quantity = 1;
        List<CartItemDTO> items = getCart(userId).getItems();

        Optional<CartItemDTO> existing = items.stream().filter(i -> productId.equals(i.getProductId())).findFirst();
        if (existing.isPresent()) {
            CartItemDTO it = existing.get();
            it.setQuantity((it.getQuantity() == null ? 0 : it.getQuantity()) + quantity);
            log.info("Incremented item productId={} qty={} user={}", productId, it.getQuantity(), userId);
        } else {
            CartItemDTO it = new CartItemDTO();
            it.setProductId(productId);
            it.setQuantity(quantity);
            items.add(it);
            log.info("Added new item productId={} qty={} user={}", productId, quantity, userId);
        }
        persist(userId, items);
        CartDTO dto = new CartDTO();
        dto.setItems(items);
        dto.setTotalCents(computeTotalCents(items));
        return dto;
    }

    public CartDTO removeItem(UUID userId, UUID productId) {
        List<CartItemDTO> items = getCart(userId).getItems();
        items.removeIf(i -> productId.equals(i.getProductId()));
        log.info("Removed item productId={} user={} remainingItems={}", productId, userId, items.size());
        persist(userId, items);
        CartDTO dto = new CartDTO();
        dto.setItems(items);
        dto.setTotalCents(computeTotalCents(items));
        return dto;
    }

    private void persist(UUID userId, List<CartItemDTO> items) {
        try {
            String json = objectMapper.writeValueAsString(items);
            String k = key(userId);
            redis.opsForValue().set(k, json, CART_TTL);
            log.info("Saved cart to Redis key={} user={} items={}", k, userId, items.size());
        } catch (Exception e) {
            log.error("Failed to serialize cart for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to save cart");
        }
    }

    private int computeTotalCents(List<CartItemDTO> items) {
        int total = 0;
        for (CartItemDTO it : items) {
            if (it.getProductId() == null || it.getQuantity() == null) continue;
            UUID pid = it.getProductId();
            int qty = Math.max(0, it.getQuantity());
            Product p = productRepository.findById(pid).orElse(null);
            if (p != null) {
                total += (p.getPriceCents() == null ? 0 : p.getPriceCents()) * qty;
            }
        }
        return total;
    }
}
