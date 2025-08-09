package com.project.notes_backend.service;

import org.springframework.security.core.Authentication;

import com.project.notes_backend.config.RateLimitingConfig.RateLimitTier;

import jakarta.servlet.http.HttpServletRequest;

public interface RateLimitService {

    /**
     * Check if the request should be allowed based on rate limiting rules
     *
     * @param request HTTP request
     * @param authentication User authentication info
     * @return true if request is allowed, false if rate limited
     */
    boolean allowRequest(HttpServletRequest request, Authentication authentication);

    /**
     * Get remaining requests for a given key
     *
     * @param key Rate limit key
     * @return Number of remaining requests
     */
    long getRemainingRequests(String key);

    /**
     * Get rate limit tier for the given authentication
     *
     * @param authentication User authentication
     * @return Rate limit tier
     */
    RateLimitTier getRateLimitTier(Authentication authentication);

    /**
     * Generate rate limit key based on request and authentication
     *
     * @param request HTTP request
     * @param authentication User authentication
     * @return Rate limit key
     */
    String generateRateLimitKey(HttpServletRequest request, Authentication authentication);

    /**
     * Reset rate limit for a specific key (admin function)
     *
     * @param key Rate limit key
     */
    void resetRateLimit(String key);

    /**
     * Get rate limit information for a key
     *
     * @param key Rate limit key
     * @return Rate limit info
     */
    RateLimitInfo getRateLimitInfo(String key);

    public static class RateLimitInfo {

        private final long remainingTokens;
        private final long capacity;
        private final long refillPeriodNanos;

        public RateLimitInfo(long remainingTokens, long capacity, long refillPeriodNanos) {
            this.remainingTokens = remainingTokens;
            this.capacity = capacity;
            this.refillPeriodNanos = refillPeriodNanos;
        }

        public long getRemainingTokens() {
            return remainingTokens;
        }

        public long getCapacity() {
            return capacity;
        }

        public long getRefillPeriodNanos() {
            return refillPeriodNanos;
        }
    }
}
