package com.project.notes_backend.config;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.RoleRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.security.jwt.JwtUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${oauth2.redirect.base-url:http://localhost:5000}")
    private String oauth2BaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Extract user information based on provider
        String provider = extractProvider(request);
        String email = extractEmail(attributes, provider);
        String username = extractUsername(attributes, provider, email);
        String name = extractName(attributes, provider);

        System.out.println("OAuth2 Login - Provider: " + provider + ", Email: " + email + ", Username: " + username);
        System.out.println("OAuth2 Attributes: " + attributes);

        try {
            // Find or create user
            User user = findOrCreateUser(email, username, name, provider);
            System.out.println("User found/created: " + user.getUserName());

            // Generate JWT token by creating UserDetailsImpl from User
            com.project.notes_backend.security.UserDetailsImpl userDetails
                    = com.project.notes_backend.security.UserDetailsImpl.build(user);
            String jwtToken = jwtUtils.generateTokenFromUsername(userDetails);

            // For testing without frontend, redirect to backend test endpoint
            // String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
            String targetUrl = UriComponentsBuilder.fromUriString(oauth2BaseUrl + "/auth/public/test")
                    .queryParam("token", jwtToken)
                    .queryParam("user", user.getUserName())
                    .queryParam("email", user.getEmail())
                    .queryParam("provider", provider)
                    .queryParam("success", "true")
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            System.err.println("OAuth2 authentication error: " + e.getMessage());
            e.printStackTrace();
            // Redirect to error page with more details
            String errorUrl = oauth2BaseUrl + "/auth/public/test?error=oauth2_failed&message="
                    + java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String extractProvider(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        if (requestURI.contains("google")) {
            return "google";
        } else if (requestURI.contains("github")) {
            return "github";
        }
        return "oauth2";
    }

    private String extractEmail(Map<String, Object> attributes, String provider) {
        String email = (String) attributes.get("email");

        if (email == null && "github".equals(provider)) {
            // GitHub might not provide public email, use login + @github.com
            String login = (String) attributes.get("login");
            if (login != null) {
                email = login + "@github.com";
            }
        }

        return email;
    }

    private String extractUsername(Map<String, Object> attributes, String provider, String email) {
        String username = null;

        if ("github".equals(provider)) {
            username = (String) attributes.get("login");
        } else if ("google".equals(provider)) {
            // Use email prefix for Google
            if (email != null) {
                username = email.split("@")[0];
            }
        }

        // Fallback to name or email
        if (username == null) {
            String name = (String) attributes.get("name");
            if (name != null) {
                username = name.toLowerCase().replaceAll("[^a-z0-9]", "");
            } else if (email != null) {
                username = email.split("@")[0];
            }
        }

        return sanitizeUsername(username);
    }

    private String extractName(Map<String, Object> attributes, String provider) {
        return (String) attributes.getOrDefault("name", "OAuth2 User");
    }

    private String sanitizeUsername(String username) {
        if (username == null) {
            return "user" + System.currentTimeMillis() % 10000;
        }

        // Remove special characters and ensure length constraints
        username = username.toLowerCase().replaceAll("[^a-z0-9]", "");

        if (username.length() < 3) {
            username = "user" + username;
        }
        if (username.length() > 20) {
            username = username.substring(0, 20);
        }

        return username;
    }

    private User findOrCreateUser(String email, String username, String name, String provider) {
        // First try to find by email
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // If not found, create new user
        return createNewUser(email, username, name, provider);
    }

    private User createNewUser(String email, String username, String name, String provider) {
        // Get default user role
        Role userRole = roleRepository.findByRoleName(AppRole.USER)
                .orElseThrow(() -> new RuntimeException("Default USER role not found"));

        // Ensure unique username
        username = findAvailableUsername(username);

        // Create new user
        User newUser = new User();
        newUser.setUserName(username);
        newUser.setEmail(email);
        newUser.setPassword(null); // OAuth2 users don't have passwords
        newUser.setRole(userRole);
        newUser.setEnabled(true);
        newUser.setAccountNonExpired(true);
        newUser.setAccountNonLocked(true);
        newUser.setCredentialsNonExpired(true);
        newUser.setTwoFactorEnabled(false);
        newUser.setSignUpMethod(provider);
        newUser.setCreatedDate(LocalDateTime.now());
        newUser.setUpdatedDate(LocalDateTime.now());
        newUser.setAccountExpiryDate(LocalDate.now().plusYears(10));
        newUser.setCredentialsExpiryDate(LocalDate.now().plusYears(10));

        User savedUser = userRepository.save(newUser);
        System.out.println("Created new OAuth2 user: " + savedUser.getUserName() + " via " + provider);

        return savedUser;
    }

    private String findAvailableUsername(String baseUsername) {
        if (!userRepository.existsByUserName(baseUsername)) {
            return baseUsername;
        }

        // Try with numbers
        for (int i = 1; i <= 999; i++) {
            String username = baseUsername + i;
            if (username.length() <= 20 && !userRepository.existsByUserName(username)) {
                return username;
            }
        }

        // Last resort - use timestamp
        return baseUsername.substring(0, Math.min(baseUsername.length(), 10))
                + System.currentTimeMillis() % 10000;
    }
}
