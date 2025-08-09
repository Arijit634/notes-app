package com.project.notes_backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.annotation.PostConstruct;

@Configuration
public class CorsConfig {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostConstruct
    public void logConfiguration() {
        System.out.println("🔧 CORS Configuration - Frontend URL: " + frontendUrl);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Always allow both local and hosted frontend URLs
        configuration.setAllowedOriginPatterns(Arrays.asList(
                frontendUrl, // Dynamic frontend URL from properties
                "http://localhost:3000", // Local development frontend
                "http://localhost:3001", // Alternative local frontend
                "http://localhost:5173", // Vite default port
                "http://notes-app-frontend-arijit634.s3-website-us-east-1.amazonaws.com", // Explicit S3 URL
                "https://*.vercel.app", // Vercel deployments
                "https://*.netlify.app", // Netlify deployments
                "http://*.s3-website-*.amazonaws.com", // S3 static website hosting
                "https://*.s3-website-*.amazonaws.com", // S3 static website hosting with HTTPS
                "http://*.s3.amazonaws.com", // S3 bucket direct access
                "https://*.s3.amazonaws.com", // S3 bucket direct access with HTTPS
                "https://*.cloudfront.net" // CloudFront distributions
        ));

        System.out.println("🌐 CORS Allowed Origins: " + configuration.getAllowedOriginPatterns());

        // Allow all HTTP methods needed for REST API
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"
        ));

        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials (important for OAuth2 and JWT)
        configuration.setAllowCredentials(true);

        // Expose headers that frontend might need
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-Total-Count",
                "X-Total-Pages"
        ));

        // Set max age for preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
