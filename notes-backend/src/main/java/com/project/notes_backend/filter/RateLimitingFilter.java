package com.project.notes_backend.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.notes_backend.service.RateLimitService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitService rateLimitService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Skip rate limiting for static resources, health checks, and actuator endpoints
        if (shouldSkipRateLimit(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!rateLimitService.allowRequest(request, authentication)) {
            handleRateLimitExceeded(request, response, authentication);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipRateLimit(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Skip static resources
        if (uri.contains("/static/") || uri.contains("/css/") || uri.contains("/js/")
                || uri.contains("/images/") || uri.endsWith(".ico")) {
            return true;
        }

        // Skip health checks and actuator
        if (uri.startsWith("/actuator/") || uri.equals("/health") || uri.equals("/info")) {
            return true;
        }

        // Skip OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        return false;
    }

    private void handleRateLimitExceeded(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        String clientIp = getClientIp(request);
        String username = authentication != null ? authentication.getName() : "anonymous";

        log.warn("Rate limit exceeded for user: {} from IP: {} on endpoint: {}",
                username, clientIp, request.getRequestURI());

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Add rate limit headers
        String rateLimitKey = rateLimitService.generateRateLimitKey(request, authentication);
        long remaining = rateLimitService.getRemainingRequests(rateLimitKey);

        response.setHeader("X-RateLimit-Limit", "60"); // Base limit
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Reset", String.valueOf(System.currentTimeMillis() + 60000)); // Reset in 1 minute
        response.setHeader("Retry-After", "60"); // Retry after 60 seconds

        RateLimitErrorResponse errorResponse = new RateLimitErrorResponse(
                "Rate limit exceeded",
                "Too many requests. Please try again later.",
                System.currentTimeMillis(),
                request.getRequestURI(),
                remaining,
                60
        );

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    public static class RateLimitErrorResponse {

        public String error;
        public String message;
        public long timestamp;
        public String path;
        public long remainingRequests;
        public int retryAfterSeconds;

        public RateLimitErrorResponse(String error, String message, long timestamp,
                String path, long remainingRequests, int retryAfterSeconds) {
            this.error = error;
            this.message = message;
            this.timestamp = timestamp;
            this.path = path;
            this.remainingRequests = remainingRequests;
            this.retryAfterSeconds = retryAfterSeconds;
        }
    }
}
