package com.project.notes_backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.project.notes_backend.service.impl.TotpServiceImpl;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;

@ExtendWith(MockitoExtension.class)
class TotpServiceTest {

    @Mock
    private GoogleAuthenticator googleAuthenticator;

    @InjectMocks
    private TotpServiceImpl totpService;

    private GoogleAuthenticatorKey testKey;

    @BeforeEach
    void setUp() {
        testKey = new GoogleAuthenticatorKey.Builder("TESTSECRET123").build();
    }

    @Test
    void testGenerateSecret() {
        // Given
        when(googleAuthenticator.createCredentials()).thenReturn(testKey);

        // When
        GoogleAuthenticatorKey result = totpService.generateSecret();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getKey()).isEqualTo("TESTSECRET123");
        verify(googleAuthenticator).createCredentials();
    }

    @Test
    void testGetQrCodeUrl() {
        // When
        String result = totpService.getQrCodeUrl(testKey, "testuser");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).contains("testuser");
        assertThat(result).contains("TESTSECRET123");
        assertThat(result).startsWith("https://api.qrserver.com");
    }

    @Test
    void testVerifyCode_ValidCode() {
        // Given
        when(googleAuthenticator.authorize("TESTSECRET123", 123456)).thenReturn(true);

        // When
        boolean result = totpService.verifyCode("TESTSECRET123", 123456);

        // Then
        assertThat(result).isTrue();
        verify(googleAuthenticator).authorize("TESTSECRET123", 123456);
    }

    @Test
    void testVerifyCode_InvalidCode() {
        // Given
        when(googleAuthenticator.authorize("TESTSECRET123", 999999)).thenReturn(false);

        // When
        boolean result = totpService.verifyCode("TESTSECRET123", 999999);

        // Then
        assertThat(result).isFalse();
        verify(googleAuthenticator).authorize("TESTSECRET123", 999999);
    }
}
