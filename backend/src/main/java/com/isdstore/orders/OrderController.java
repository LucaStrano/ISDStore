package com.isdstore.orders;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.isdstore.cart.CartService;
import com.isdstore.common.dto.CartDTO;
import com.isdstore.common.dto.CartItemDTO;
import com.isdstore.common.dto.OrderDTO;
import com.isdstore.common.entity.Order;
import com.isdstore.common.entity.User;
import com.isdstore.common.repo.OrderRepository;
import com.isdstore.common.repo.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, CartService cartService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        UUID userId = currentUserId();
        log.info("POST /api/checkout user={}", userId);
        CartDTO cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            log.warn("Checkout attempted with empty cart user={}", userId);
            return ResponseEntity.badRequest().body("Cart is empty");
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.error("User not found for checkout user={}", userId);
            return ResponseEntity.badRequest().body("User not found");
        }

        String itemsJson;
        try {
            itemsJson = objectMapper.writeValueAsString(cart.getItems());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize order items for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to create order");
        }

        Order order = new Order();
        order.setUser(userOpt.get());
        order.setItems(itemsJson);
        order.setTotalCents(cart.getTotalCents());
        order.setStatus("completed");

        Order saved = orderRepository.save(order);
        log.info("Order created id={} user={} totalCents={}", saved.getId(), userId, saved.getTotalCents());

        // Clear the cart in Redis
        cartService.clearCart(userId);

        OrderDTO dto = toDto(saved);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/orders")
    public List<OrderDTO> myOrders() {
        UUID userId = currentUserId();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/admin/orders")
    public List<OrderDTO> allOrders() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("Unauthenticated");
        }
        return UUID.fromString(auth.getPrincipal().toString());
    }

    private OrderDTO toDto(Order o) {
        OrderDTO dto = new OrderDTO();
        dto.setId(o.getId());
        dto.setUserId(o.getUser() != null ? o.getUser().getId() : null);
        try {
            List<CartItemDTO> items = objectMapper.readValue(o.getItems(), objectMapper.getTypeFactory().constructCollectionType(List.class, CartItemDTO.class));
            dto.setItems(items);
        } catch (Exception e) {
            dto.setItems(Collections.emptyList());
        }
        dto.setTotalCents(o.getTotalCents());
        dto.setStatus(o.getStatus());
        dto.setCreatedAt(o.getCreatedAt());
        return dto;
    }
}
