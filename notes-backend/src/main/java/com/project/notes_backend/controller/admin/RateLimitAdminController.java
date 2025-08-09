package com.project.notes_backend.controller.admin;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.service.RateLimitService;
import com.project.notes_backend.service.RateLimitService.RateLimitInfo;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/rate-limit")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class RateLimitAdminController {

    @Autowired
    private RateLimitService rateLimitService;

    @GetMapping("/status/{key}")
    public ResponseEntity<RateLimitInfo> getRateLimitStatus(@PathVariable String key) {
        log.info("Admin checking rate limit status for key: {}", key);
        RateLimitInfo info = rateLimitService.getRateLimitInfo(key);
        return ResponseEntity.ok(info);
    }

    @DeleteMapping("/reset/{key}")
    public ResponseEntity<Map<String, String>> resetRateLimit(@PathVariable String key) {
        log.info("Admin resetting rate limit for key: {}", key);
        rateLimitService.resetRateLimit(key);
        return ResponseEntity.ok(Map.of("message", "Rate limit reset successfully for key: " + key));
    }

    @GetMapping("/remaining/{key}")
    public ResponseEntity<Map<String, Long>> getRemainingRequests(@PathVariable String key) {
        long remaining = rateLimitService.getRemainingRequests(key);
        return ResponseEntity.ok(Map.of("remainingRequests", remaining));
    }
}
