package com.dvbakes.controller;

import com.dvbakes.entity.Order;
import com.dvbakes.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ─── CART ──────────────────────────────────────────────────────────

    @GetMapping("/cart")
    public ResponseEntity<Map<String, Object>> getCart(@RequestParam(required = false) String cartId) {
        return ResponseEntity.ok(orderService.getCart(cartId));
    }

    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body) {
        try {
            String cartId = (String) body.get("cartId");
            String productId = (String) body.get("productId");
            int quantity = body.get("quantity") != null ? ((Number) body.get("quantity")).intValue() : 1;
            @SuppressWarnings("unchecked")
            Map<String, Boolean> toppings = (Map<String, Boolean>) body.get("toppings");
            return ResponseEntity.ok(orderService.addToCart(cartId, productId, quantity, toppings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/cart/item")
    public ResponseEntity<?> updateCartItem(@RequestBody Map<String, Object> body) {
        try {
            String cartId = (String) body.get("cartId");
            String itemId = (String) body.get("itemId");
            int quantity = body.get("quantity") != null ? ((Number) body.get("quantity")).intValue() : 0;
            @SuppressWarnings("unchecked")
            Map<String, Boolean> toppings = (Map<String, Boolean>) body.get("toppings");
            return ResponseEntity.ok(orderService.updateCartItem(cartId, itemId, quantity, toppings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/cart/item")
    public ResponseEntity<?> removeFromCart(@RequestBody Map<String, Object> body) {
        String cartId = (String) body.get("cartId");
        String itemId = (String) body.get("itemId");
        return ResponseEntity.ok(orderService.removeFromCart(cartId, itemId));
    }

    @PostMapping("/cart/clear")
    public ResponseEntity<?> clearCart(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(orderService.clearCart((String) body.get("cartId")));
    }

    // ─── ORDERS ────────────────────────────────────────────────────────

    @PostMapping("/orders")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body) {
        try {
            String cartId = (String) body.get("cartId");
            String name = (String) body.get("customerName");
            String phone = (String) body.get("customerPhone");
            String address = (String) body.get("customerAddress");
            String payMethod = (String) body.get("paymentMethod");
            String payStatus = (String) body.get("paymentStatus");

            if (cartId == null || name == null || phone == null || address == null || payMethod == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing order information details."));
            }

            Order order = orderService.placeOrder(cartId, name, phone, address, payMethod, payStatus);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String orderStatus = body.get("orderStatus");
            String paymentStatus = body.get("paymentStatus");
            Order updated = orderService.updateOrderStatus(id, orderStatus, paymentStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
