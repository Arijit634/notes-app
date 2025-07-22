package com.project.notes_backend.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.project.notes_backend.security.UserDetailsServiceImpl;
import com.project.notes_backend.security.jwt.AuthTokenFilter;

@ExtendWith(MockitoExtension.class)
class WebSecurityConfigTest {

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private AuthTokenFilter authTokenFilter;

    @Mock
    private AuthenticationConfiguration authConfig;

    @Mock
    private AuthenticationManager authenticationManager;

    private WebSecurityConfig webSecurityConfig;

    @BeforeEach
    void setUp() {
        webSecurityConfig = new WebSecurityConfig();
        ReflectionTestUtils.setField(webSecurityConfig, "userDetailsService", userDetailsService);
        ReflectionTestUtils.setField(webSecurityConfig, "authTokenFilter", authTokenFilter);
    }

    @Test
    void testAuthenticationProvider() {
        // Act
        DaoAuthenticationProvider provider = webSecurityConfig.authenticationProvider();

        // Assert
        assertNotNull(provider);
        // Test that provider is properly configured
        assertDoesNotThrow(() -> provider.toString());
    }

    @Test
    void testAuthenticationManager() throws Exception {
        // Arrange
        when(authConfig.getAuthenticationManager()).thenReturn(authenticationManager);

        // Act
        AuthenticationManager result = webSecurityConfig.authenticationManager(authConfig);

        // Assert
        assertNotNull(result);
        assertEquals(authenticationManager, result);
        verify(authConfig).getAuthenticationManager();
    }

    @Test
    void testPasswordEncoder() {
        // Act
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();

        // Assert
        assertNotNull(encoder);
        assertTrue(encoder.getClass().getSimpleName().equals("BCryptPasswordEncoder"));
    }

    @Test
    void testPasswordEncoderEncoding() {
        // Arrange
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String rawPassword = "testPassword123";

        // Act
        String encodedPassword = encoder.encode(rawPassword);

        // Assert
        assertNotNull(encodedPassword);
        assertNotEquals(rawPassword, encodedPassword);
        assertTrue(encoder.matches(rawPassword, encodedPassword));
    }

    @Test
    void testPasswordEncoderMatching() {
        // Arrange
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String rawPassword = "mySecretPassword";
        String encodedPassword = encoder.encode(rawPassword);

        // Act & Assert
        assertTrue(encoder.matches(rawPassword, encodedPassword));
        assertFalse(encoder.matches("wrongPassword", encodedPassword));
    }

    @Test
    void testCorsConfigurationSource() {
        // Act
        CorsConfigurationSource corsSource = webSecurityConfig.corsConfigurationSource();

        // Assert
        assertNotNull(corsSource);
        assertTrue(corsSource instanceof UrlBasedCorsConfigurationSource);
    }

    @Test
    void testCorsConfigurationSourceType() {
        // Act
        CorsConfigurationSource corsSource = webSecurityConfig.corsConfigurationSource();

        // Assert
        assertNotNull(corsSource);
        assertEquals(UrlBasedCorsConfigurationSource.class, corsSource.getClass());
    }

    @Test
    void testConfigurationInstantiation() {
        // Act & Assert
        assertNotNull(webSecurityConfig);
        assertDoesNotThrow(() -> new WebSecurityConfig());
    }

    @Test
    void testMultiplePasswordEncoderInstances() {
        // Act
        PasswordEncoder encoder1 = webSecurityConfig.passwordEncoder();
        PasswordEncoder encoder2 = webSecurityConfig.passwordEncoder();

        // Assert
        assertNotNull(encoder1);
        assertNotNull(encoder2);
        // Each call should return a new instance
        assertNotSame(encoder1, encoder2);
        assertEquals(encoder1.getClass(), encoder2.getClass());
    }

    @Test
    void testMultipleCorsConfigurationSourceInstances() {
        // Act
        CorsConfigurationSource corsSource1 = webSecurityConfig.corsConfigurationSource();
        CorsConfigurationSource corsSource2 = webSecurityConfig.corsConfigurationSource();

        // Assert
        assertNotNull(corsSource1);
        assertNotNull(corsSource2);
        assertNotSame(corsSource1, corsSource2);
    }

    @Test
    void testAuthenticationManagerException() throws Exception {
        // Arrange
        when(authConfig.getAuthenticationManager()).thenThrow(new RuntimeException("Config error"));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> webSecurityConfig.authenticationManager(authConfig));
        assertEquals("Config error", exception.getMessage());
        verify(authConfig).getAuthenticationManager();
    }

    @Test
    void testPasswordEncoderStrength() {
        // Arrange
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();
        String simplePassword = "123";
        String complexPassword = "Complex!Password@123";

        // Act
        String encodedSimple = encoder.encode(simplePassword);
        String encodedComplex = encoder.encode(complexPassword);

        // Assert
        assertNotNull(encodedSimple);
        assertNotNull(encodedComplex);
        assertTrue(encoder.matches(simplePassword, encodedSimple));
        assertTrue(encoder.matches(complexPassword, encodedComplex));
        assertFalse(encoder.matches(simplePassword, encodedComplex));
        assertFalse(encoder.matches(complexPassword, encodedSimple));
    }

    @Test
    void testAuthenticationProviderCreation() {
        // Act
        DaoAuthenticationProvider provider1 = webSecurityConfig.authenticationProvider();
        DaoAuthenticationProvider provider2 = webSecurityConfig.authenticationProvider();

        // Assert
        assertNotNull(provider1);
        assertNotNull(provider2);
        assertNotSame(provider1, provider2);
    }

    @Test
    void testPasswordEncoderNullInput() {
        // Arrange
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> encoder.encode(null));
    }

    @Test
    void testPasswordEncoderEmptyInput() {
        // Arrange
        PasswordEncoder encoder = webSecurityConfig.passwordEncoder();

        // Act
        String encoded = encoder.encode("");

        // Assert
        assertNotNull(encoded);
        assertTrue(encoder.matches("", encoded));
    }
}
