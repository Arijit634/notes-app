package com.project.notes_backend.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserConstructorWithAllFields() {
        // When
        User user = new User("testuser", "test@example.com", "password");

        // Then
        assertEquals("testuser", user.getUserName());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("password", user.getPassword());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
        assertFalse(user.isTwoFactorEnabled());
    }

    @Test
    void testUserConstructorWithUsernameAndEmail() {
        // When
        User user = new User("testuser", "test@example.com");

        // Then
        assertEquals("testuser", user.getUserName());
        assertEquals("test@example.com", user.getEmail());
        assertNull(user.getPassword());
    }

    @Test
    void testUserSettersAndGetters() {
        // Given
        User user = new User();
        LocalDate expiryDate = LocalDate.now().plusYears(1);
        LocalDateTime now = LocalDateTime.now();

        // When
        user.setUserId(1L);
        user.setUserName("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setAccountNonLocked(false);
        user.setAccountNonExpired(false);
        user.setCredentialsNonExpired(false);
        user.setEnabled(false);
        user.setCredentialsExpiryDate(expiryDate);
        user.setAccountExpiryDate(expiryDate);
        user.setTwoFactorSecret("secret");
        user.setTwoFactorEnabled(true);
        user.setSignUpMethod("email");
        user.setCreatedDate(now);
        user.setUpdatedDate(now);

        // Then
        assertEquals(1L, user.getUserId());
        assertEquals("testuser", user.getUserName());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("password", user.getPassword());
        assertFalse(user.isAccountNonLocked());
        assertFalse(user.isAccountNonExpired());
        assertFalse(user.isCredentialsNonExpired());
        assertFalse(user.isEnabled());
        assertEquals(expiryDate, user.getCredentialsExpiryDate());
        assertEquals(expiryDate, user.getAccountExpiryDate());
        assertEquals("secret", user.getTwoFactorSecret());
        assertTrue(user.isTwoFactorEnabled());
        assertEquals("email", user.getSignUpMethod());
        assertEquals(now, user.getCreatedDate());
        assertEquals(now, user.getUpdatedDate());
    }

    @Test
    void testUserEqualsAndHashCode() {
        // Given
        User user1 = new User();
        user1.setUserId(1L);

        User user2 = new User();
        user2.setUserId(1L);

        User user3 = new User();
        user3.setUserId(2L);

        // Then
        assertEquals(user1, user2);
        assertNotEquals(user1, user3);
        assertEquals(user1.hashCode(), user2.hashCode());

        // Test self equality
        assertEquals(user1, user1);

        // Test null and different class
        assertNotEquals(user1, null);
        assertNotEquals(user1, "string");
    }

    @Test
    void testUserRoleRelationship() {
        // Given
        User user = new User();
        Role role = new Role();
        role.setRoleId(1);
        role.setRoleName(AppRole.USER);

        // When
        user.setRole(role);

        // Then
        assertEquals(role, user.getRole());
        assertEquals(AppRole.USER, user.getRole().getRoleName());
    }
}
