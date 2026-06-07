package com.dvbakes.controller;

import com.dvbakes.dto.AdminDashboardDto;
import com.dvbakes.dto.DatabaseMetricsDto;
import com.dvbakes.entity.Order;
import com.dvbakes.entity.Product;
import com.dvbakes.repository.ApiMetricRepository;
import com.dvbakes.repository.OrderRepository;
import com.dvbakes.repository.ProductRepository;
import com.dvbakes.service.DatabaseMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ApiMetricRepository apiMetricRepository;
    private final DatabaseMonitorService dbMonitorService;

    /**
     * GET /api/admin/dashboard
     * Returns complete admin dashboard data in one call.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        Double totalRevenue = orderRepository.getTotalRevenue();
        long activeOrders = orderRepository.countActiveOrders();
        long totalProducts = productRepository.countActiveProducts();
        List<Product> outOfStock = productRepository.findOutOfStockProducts();
        String today = LocalDate.now().toString();
        long ordersToday = orderRepository.countOrdersByDate(today);

        // Category distribution
        List<Product> allProducts = productRepository.findAllByActiveTrueOrderByCreatedAtDesc();
        Map<String, Long> categoryDist = allProducts.stream()
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        // Live DB metrics
        DatabaseMetricsDto dbMetrics = dbMonitorService.collectMetrics();

        // Avg response time (last 60 mins)
        String oneHourAgo = java.time.Instant.now().minusSeconds(3600).toString();
        Double avgResponse = apiMetricRepository.getAverageResponseTime(oneHourAgo);
        long totalRequests = apiMetricRepository.countRequestsSince(oneHourAgo);

        return ResponseEntity.ok(AdminDashboardDto.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .activeOrders(activeOrders)
                .totalProducts(totalProducts)
                .outOfStockCount(outOfStock.size())
                .totalOrdersToday(ordersToday)
                .dbMetrics(dbMetrics)
                .categoryDistribution(categoryDist)
                .avgResponseTimeMs(avgResponse != null ? avgResponse : 0.0)
                .totalApiRequests(totalRequests)
                .build());
    }

    /**
     * GET /api/admin/db-metrics
     * Returns current live database connection pool status.
     */
    @GetMapping("/db-metrics")
    public ResponseEntity<DatabaseMetricsDto> getDbMetrics() {
        return ResponseEntity.ok(dbMonitorService.collectMetrics());
    }

    /**
     * GET /api/admin/server-health
     * Returns server health summary.
     */
    @GetMapping("/server-health")
    public ResponseEntity<Map<String, Object>> getServerHealth() {
        Runtime rt = Runtime.getRuntime();
        long usedMemoryMB = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
        long totalMemoryMB = rt.totalMemory() / (1024 * 1024);
        long maxMemoryMB = rt.maxMemory() / (1024 * 1024);
        int availableProcessors = rt.availableProcessors();

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "usedMemoryMB", usedMemoryMB,
                "totalMemoryMB", totalMemoryMB,
                "maxMemoryMB", maxMemoryMB,
                "availableProcessors", availableProcessors,
                "memoryUsagePercent", Math.round((double) usedMemoryMB / maxMemoryMB * 100),
                "javaVersion", System.getProperty("java.version"),
                "uptime", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000
        ));
    }
}
