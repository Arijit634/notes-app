package com.project.notes_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spring.app")
public class JwtProperties {
    
    private String jwtSecret;
    private Long jwtExpirationMs;
    
    public String getJwtSecret() {
        return jwtSecret;
    }
    
    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }
    
    public Long getJwtExpirationMs() {
        return jwtExpirationMs;
    }
    
    public void setJwtExpirationMs(Long jwtExpirationMs) {
        this.jwtExpirationMs = jwtExpirationMs;
    }
}
