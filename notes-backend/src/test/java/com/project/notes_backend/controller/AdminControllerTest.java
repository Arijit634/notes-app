package com.project.notes_backend.controller;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.project.notes_backend.dto.UserDTO;
import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.service.UserService;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AdminController adminController;

    private User testUser;
    private UserDTO testUserDTO;
    private Role adminRole;
    private Role userRole;

    @BeforeEach
    void setUp() {
        adminRole = new Role();
        adminRole.setRoleId(1);
        adminRole.setRoleName(AppRole.ADMIN);

        userRole = new Role();
        userRole.setRoleId(2);
        userRole.setRoleName(AppRole.USER);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole(userRole);
        testUser.setEnabled(true);
        testUser.setAccountNonLocked(true);
        testUser.setAccountNonExpired(true);
        testUser.setCredentialsNonExpired(true);
        testUser.setAccountExpiryDate(LocalDate.now().plusYears(1));
        testUser.setCredentialsExpiryDate(LocalDate.now().plusYears(1));

        testUserDTO = new UserDTO();
        testUserDTO.setUserId(1L);
        testUserDTO.setUserName("testuser");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setRole(userRole);
        testUserDTO.setEnabled(true);
        testUserDTO.setAccountNonLocked(true);
        testUserDTO.setAccountNonExpired(true);
        testUserDTO.setCredentialsNonExpired(true);
    }

    @Test
    void testGetUsers_Success() {
        // Arrange
        List<User> users = List.of(testUser);
        when(userService.getAllUsers()).thenReturn(users);

        // Act
        ResponseEntity<List<User>> response = adminController.getUsers();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("testuser", response.getBody().get(0).getUserName());
        verify(userService).getAllUsers();
    }

    @Test
    void testGetUsers_EmptyList() {
        // Arrange
        List<User> emptyList = List.of();
        when(userService.getAllUsers()).thenReturn(emptyList);

        // Act
        ResponseEntity<List<User>> response = adminController.getUsers();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
        verify(userService).getAllUsers();
    }

    @Test
    void testUpdateUserRole_Success() {
        // Arrange
        Long userId = 1L;
        String newRole = "ADMIN";
        doNothing().when(userService).updateUserRole(userId, newRole);

        // Act
        ResponseEntity<String> response = adminController.updateUserRole(userId, newRole);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User role updated successfully", response.getBody());
        verify(userService).updateUserRole(userId, newRole);
    }

    @Test
    void testUpdateUserRole_Exception() {
        // Arrange
        Long userId = 1L;
        String newRole = "ADMIN";
        doThrow(new RuntimeException("Role not found")).when(userService).updateUserRole(userId, newRole);

        // Act
        ResponseEntity<String> response = adminController.updateUserRole(userId, newRole);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Error updating user role"));
        verify(userService).updateUserRole(userId, newRole);
    }

    @Test
    void testGetUserById_Success() {
        // Arrange
        Long userId = 1L;
        when(userService.getUserById(userId)).thenReturn(testUserDTO);

        // Act
        ResponseEntity<UserDTO> response = adminController.getUserById(userId);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("testuser", response.getBody().getUserName());
        verify(userService).getUserById(userId);
    }

    @Test
    void testGetUserById_NotFound() {
        // Arrange
        Long userId = 999L;
        when(userService.getUserById(userId)).thenReturn(null);

        // Act
        ResponseEntity<UserDTO> response = adminController.getUserById(userId);

        // Assert
        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(userService).getUserById(userId);
    }

    @Test
    void testUpdateAccountLockStatus_Lock_Success() {
        // Arrange
        Long userId = 1L;
        boolean lock = true;
        doNothing().when(userService).updateAccountLockStatus(userId, lock);

        // Act
        ResponseEntity<String> response = adminController.updateAccountLockStatus(userId, lock);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account locked successfully", response.getBody());
        verify(userService).updateAccountLockStatus(userId, lock);
    }

    @Test
    void testUpdateAccountLockStatus_Unlock_Success() {
        // Arrange
        Long userId = 1L;
        boolean lock = false;
        doNothing().when(userService).updateAccountLockStatus(userId, lock);

        // Act
        ResponseEntity<String> response = adminController.updateAccountLockStatus(userId, lock);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account unlocked successfully", response.getBody());
        verify(userService).updateAccountLockStatus(userId, lock);
    }

    @Test
    void testUpdateAccountLockStatus_Exception() {
        // Arrange
        Long userId = 1L;
        boolean lock = true;
        doThrow(new RuntimeException("User not found")).when(userService).updateAccountLockStatus(userId, lock);

        // Act
        ResponseEntity<String> response = adminController.updateAccountLockStatus(userId, lock);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Error updating lock status"));
        verify(userService).updateAccountLockStatus(userId, lock);
    }

    @Test
    void testUpdateAccountEnabledStatus_Enable_Success() {
        // Arrange
        Long userId = 1L;
        boolean enabled = true;
        doNothing().when(userService).updateAccountEnabledStatus(userId, enabled);

        // Act
        ResponseEntity<String> response = adminController.updateAccountEnabledStatus(userId, enabled);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account enabled successfully", response.getBody());
        verify(userService).updateAccountEnabledStatus(userId, enabled);
    }

    @Test
    void testUpdateAccountEnabledStatus_Disable_Success() {
        // Arrange
        Long userId = 1L;
        boolean enabled = false;
        doNothing().when(userService).updateAccountEnabledStatus(userId, enabled);

        // Act
        ResponseEntity<String> response = adminController.updateAccountEnabledStatus(userId, enabled);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account disabled successfully", response.getBody());
        verify(userService).updateAccountEnabledStatus(userId, enabled);
    }

    @Test
    void testUpdateAccountEnabledStatus_Exception() {
        // Arrange
        Long userId = 1L;
        boolean enabled = true;
        doThrow(new RuntimeException("Database error")).when(userService).updateAccountEnabledStatus(userId, enabled);

        // Act
        ResponseEntity<String> response = adminController.updateAccountEnabledStatus(userId, enabled);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Error updating enabled status"));
        verify(userService).updateAccountEnabledStatus(userId, enabled);
    }

    @Test
    void testUpdateAccountExpiryStatus_Expire_Success() {
        // Arrange
        Long userId = 1L;
        boolean expire = true;
        doNothing().when(userService).updateAccountExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateAccountExpiryStatus(userId, expire);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account set to expired successfully", response.getBody());
        verify(userService).updateAccountExpiryStatus(userId, expire);
    }

    @Test
    void testUpdateAccountExpiryStatus_NotExpire_Success() {
        // Arrange
        Long userId = 1L;
        boolean expire = false;
        doNothing().when(userService).updateAccountExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateAccountExpiryStatus(userId, expire);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User account set to not expired successfully", response.getBody());
        verify(userService).updateAccountExpiryStatus(userId, expire);
    }

    @Test
    void testUpdateAccountExpiryStatus_Exception() {
        // Arrange
        Long userId = 1L;
        boolean expire = true;
        doThrow(new RuntimeException("Service error")).when(userService).updateAccountExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateAccountExpiryStatus(userId, expire);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Error updating account expiry"));
        verify(userService).updateAccountExpiryStatus(userId, expire);
    }

    @Test
    void testUpdateCredentialsExpiryStatus_Expire_Success() {
        // Arrange
        Long userId = 1L;
        boolean expire = true;
        doNothing().when(userService).updateCredentialsExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateCredentialsExpiryStatus(userId, expire);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User credentials set to expired successfully", response.getBody());
        verify(userService).updateCredentialsExpiryStatus(userId, expire);
    }

    @Test
    void testUpdateCredentialsExpiryStatus_NotExpire_Success() {
        // Arrange
        Long userId = 1L;
        boolean expire = false;
        doNothing().when(userService).updateCredentialsExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateCredentialsExpiryStatus(userId, expire);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User credentials set to not expired successfully", response.getBody());
        verify(userService).updateCredentialsExpiryStatus(userId, expire);
    }

    @Test
    void testUpdateCredentialsExpiryStatus_Exception() {
        // Arrange
        Long userId = 1L;
        boolean expire = true;
        doThrow(new RuntimeException("Invalid user")).when(userService).updateCredentialsExpiryStatus(userId, expire);

        // Act
        ResponseEntity<String> response = adminController.updateCredentialsExpiryStatus(userId, expire);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody().contains("Error updating credentials expiry"));
        verify(userService).updateCredentialsExpiryStatus(userId, expire);
    }

    @Test
    void testGetAllRoles_Success() {
        // Arrange
        List<Role> roles = List.of(userRole, adminRole);
        when(userService.getAllRoles()).thenReturn(roles);

        // Act
        ResponseEntity<List<Role>> response = adminController.getAllRoles();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        verify(userService).getAllRoles();
    }

    @Test
    void testGetAllRoles_Exception() {
        // Arrange
        when(userService.getAllRoles()).thenThrow(new RuntimeException("Database connection failed"));

        // Act
        ResponseEntity<List<Role>> response = adminController.getAllRoles();

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertNull(response.getBody());
        verify(userService).getAllRoles();
    }

    @Test
    void testGetAllRoles_EmptyList() {
        // Arrange
        List<Role> emptyRoles = List.of();
        when(userService.getAllRoles()).thenReturn(emptyRoles);

        // Act
        ResponseEntity<List<Role>> response = adminController.getAllRoles();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
        verify(userService).getAllRoles();
    }
}
