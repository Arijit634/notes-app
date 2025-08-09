package com.project.notes_backend.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "app.rate-limit")
@Data
public class RateLimitingConfig {

    // Rate limiting tiers
    private long defaultRequestsPerMinute = 60;
    private long authenticatedRequestsPerMinute = 120;
    private long adminRequestsPerMinute = 500;

    // Burst limits (short-term spikes)
    private long defaultBurstLimit = 10;
    private long authenticatedBurstLimit = 20;
    private long adminBurstLimit = 50;

    // Cache settings
    private long cacheMaxSize = 10000;
    private long cacheExpireMinutes = 60;

    // Endpoint-specific limits
    private Map<String, Long> endpointLimits = new ConcurrentHashMap<>();

    public RateLimitingConfig() {
        // Initialize endpoint-specific limits
        // High-frequency endpoints (lower limits)
        endpointLimits.put("/api/activities/recent", 30L); // 30 per minute
        endpointLimits.put("/api/notes/search", 60L); // 60 per minute
        endpointLimits.put("/api/notes/favorites", 30L); // 30 per minute

        // Medium-frequency endpoints
        endpointLimits.put("/api/notes", 100L); // 100 per minute
        endpointLimits.put("/api/notes/stats", 30L); // 30 per minute

        // Low-frequency endpoints (higher limits)
        endpointLimits.put("/api/auth/login", 10L); // 10 per minute (security)
        endpointLimits.put("/api/auth/register", 5L); // 5 per minute (security)
        endpointLimits.put("/api/auth/refresh", 20L); // 20 per minute

        // Admin endpoints
        endpointLimits.put("/api/admin/**", 100L); // 100 per minute
    }

    @Bean
    public Cache<String, Bucket> rateLimitCache() {
        return Caffeine.newBuilder()
                .maximumSize(cacheMaxSize)
                .expireAfterWrite(Duration.ofMinutes(cacheExpireMinutes))
                .build();
    }

    public Bucket createBucket(RateLimitTier tier) {
        return createBucket(tier, null);
    }

    public Bucket createBucket(RateLimitTier tier, String endpoint) {
        long requestsPerMinute;
        long burstLimit;

        // Check for endpoint-specific limits first
        if (endpoint != null && endpointLimits.containsKey(endpoint)) {
            requestsPerMinute = endpointLimits.get(endpoint);
            burstLimit = Math.min(requestsPerMinute / 3, getDefaultBurstLimit(tier));
        } else {
            // Use tier-based limits
            switch (tier) {
                case ADMIN:
                    requestsPerMinute = adminRequestsPerMinute;
                    burstLimit = adminBurstLimit;
                    break;
                case AUTHENTICATED:
                    requestsPerMinute = authenticatedRequestsPerMinute;
                    burstLimit = authenticatedBurstLimit;
                    break;
                case ANONYMOUS:
                default:
                    requestsPerMinute = defaultRequestsPerMinute;
                    burstLimit = defaultBurstLimit;
                    break;
            }
        }

        // Create bandwidth with burst capacity and steady refill
        Bandwidth limit = Bandwidth.builder()
                .capacity(burstLimit)
                .refillIntervally(requestsPerMinute, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private long getDefaultBurstLimit(RateLimitTier tier) {
        switch (tier) {
            case ADMIN:
                return adminBurstLimit;
            case AUTHENTICATED:
                return authenticatedBurstLimit;
            case ANONYMOUS:
            default:
                return defaultBurstLimit;
        }
    }

    public enum RateLimitTier {
        ANONYMOUS,
        AUTHENTICATED,
        ADMIN
    }
}
