package com.isdstore.orders;

import com.isdstore.common.dto.OrderDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        // TODO convert cart (from REDIS) to order (into POSTGRESQL)
        return ResponseEntity.ok("order-created-stub");
    }

    @GetMapping("/orders")
    public List<OrderDTO> myOrders() {
        // TODO list user orders (from POSTGRESQL)
        return Collections.emptyList();
    }

    @GetMapping("/admin/orders")
    public List<OrderDTO> allOrders() {
        // TODO admin list all
        return Collections.emptyList();
    }
}
