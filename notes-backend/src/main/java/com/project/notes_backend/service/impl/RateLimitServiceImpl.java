package com.project.notes_backend.service.impl;

import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.github.benmanes.caffeine.cache.Cache;
import com.project.notes_backend.config.RateLimitingConfig;
import com.project.notes_backend.config.RateLimitingConfig.RateLimitTier;
import com.project.notes_backend.service.RateLimitService;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RateLimitServiceImpl implements RateLimitService {

    @Autowired
    private RateLimitingConfig rateLimitConfig;

    @Autowired
    private Cache<String, Bucket> rateLimitCache;

    @Override
    public boolean allowRequest(HttpServletRequest request, Authentication authentication) {
        String key = generateRateLimitKey(request, authentication);
        String endpoint = getEndpointPattern(request.getRequestURI());

        Bucket bucket = rateLimitCache.get(key, k -> {
            RateLimitTier tier = getRateLimitTier(authentication);
            return rateLimitConfig.createBucket(tier, endpoint);
        });

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            log.warn("Rate limit exceeded for key: {} on endpoint: {}", key, endpoint);
            return false;
        }

        // Log if getting close to limit (less than 10% remaining)
        if (probe.getRemainingTokens() < (bucket.getAvailableTokens() * 0.1)) {
            log.info("Rate limit warning for key: {} - {} tokens remaining", key, probe.getRemainingTokens());
        }

        return true;
    }

    @Override
    public long getRemainingRequests(String key) {
        Bucket bucket = rateLimitCache.getIfPresent(key);
        return bucket != null ? bucket.getAvailableTokens() : 0;
    }

    @Override
    public RateLimitTier getRateLimitTier(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return RateLimitTier.ANONYMOUS;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        boolean isAdmin = authorities.stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority()) || "ADMIN".equals(auth.getAuthority()));

        return isAdmin ? RateLimitTier.ADMIN : RateLimitTier.AUTHENTICATED;
    }

    @Override
    public String generateRateLimitKey(HttpServletRequest request, Authentication authentication) {
        String clientIp = getClientIpAddress(request);
        String endpoint = getEndpointPattern(request.getRequestURI());

        if (authentication != null && authentication.isAuthenticated()) {
            // For authenticated users, combine username and IP for better security
            String username = authentication.getName();
            return String.format("user:%s:ip:%s:endpoint:%s", username, clientIp, endpoint);
        } else {
            // For anonymous users, use IP only
            return String.format("ip:%s:endpoint:%s", clientIp, endpoint);
        }
    }

    @Override
    public void resetRateLimit(String key) {
        rateLimitCache.invalidate(key);
        log.info("Rate limit reset for key: {}", key);
    }

    @Override
    public RateLimitInfo getRateLimitInfo(String key) {
        Bucket bucket = rateLimitCache.getIfPresent(key);
        if (bucket == null) {
            return new RateLimitInfo(0, 0, 0);
        }

        long remainingTokens = bucket.getAvailableTokens();
        // Note: Getting capacity and refill period would require accessing bucket internals
        // For now, return basic info
        return new RateLimitInfo(remainingTokens, 0, 0);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }

        String xClusterClientIp = request.getHeader("X-Cluster-Client-IP");
        if (StringUtils.hasText(xClusterClientIp)) {
            return xClusterClientIp;
        }

        return request.getRemoteAddr();
    }

    private String getEndpointPattern(String requestURI) {
        // Normalize endpoint patterns to group similar endpoints
        if (requestURI.startsWith("/api/notes/")) {
            if (requestURI.matches("/api/notes/\\d+.*")) {
                return "/api/notes/{id}";
            } else if (requestURI.contains("/favorites")) {
                return "/api/notes/favorites";
            } else if (requestURI.contains("/stats")) {
                return "/api/notes/stats";
            } else if (requestURI.contains("/search")) {
                return "/api/notes/search";
            }
            return "/api/notes";
        } else if (requestURI.startsWith("/api/activities/")) {
            if (requestURI.contains("/recent")) {
                return "/api/activities/recent";
            }
            return "/api/activities";
        } else if (requestURI.startsWith("/api/auth/")) {
            if (requestURI.contains("/login")) {
                return "/api/auth/login";
            } else if (requestURI.contains("/register")) {
                return "/api/auth/register";
            } else if (requestURI.contains("/refresh")) {
                return "/api/auth/refresh";
            }
            return "/api/auth";
        } else if (requestURI.startsWith("/api/admin/")) {
            return "/api/admin/**";
        }

        return requestURI;
    }
}
