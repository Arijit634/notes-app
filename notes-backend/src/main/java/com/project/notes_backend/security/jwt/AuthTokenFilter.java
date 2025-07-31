package com.project.notes_backend.security.jwt;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.project.notes_backend.security.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        logger.debug("AuthTokenFilter called for URI: {}", request.getRequestURI());

        // Skip JWT processing for public endpoints
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)) {
            logger.debug("Skipping JWT processing for public endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication
                        = new UsernamePasswordAuthenticationToken(userDetails,
                                null,
                                userDetails.getAuthorities());
                logger.debug("Roles from JWT: {}", userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String jwt = jwtUtils.getJwtFromHeader(request);
        logger.debug("AuthTokenFilter.java: {}", jwt);
        return jwt;
    }

    /**
     * Check if the requested path is a public endpoint that should skip JWT
     * processing
     */
    private boolean isPublicEndpoint(String requestPath) {
        return requestPath.startsWith("/auth/public/")
                || requestPath.startsWith("/api/auth/public/")
                || requestPath.startsWith("/oauth2/")
                || requestPath.startsWith("/login")
                || requestPath.equals("/error")
                || requestPath.equals("/favicon.ico")
                || requestPath.startsWith("/actuator/")
                || requestPath.startsWith("/swagger-ui/")
                || requestPath.equals("/swagger-ui.html")
                || requestPath.startsWith("/api-docs")
                || requestPath.startsWith("/v3/api-docs/")
                || requestPath.startsWith("/swagger-resources/")
                || requestPath.startsWith("/webjars/");
    }
}
