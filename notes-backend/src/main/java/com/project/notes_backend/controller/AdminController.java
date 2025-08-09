package com.project.notes_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.dto.UserDTO;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.service.ActivityCleanupService;
import com.project.notes_backend.service.UserService;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityCleanupService activityCleanupService;

    @GetMapping("/getusers")
    public ResponseEntity<List<User>> getUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @PutMapping("/update-role")
    public ResponseEntity<String> updateUserRole(@RequestParam Long userId, @RequestParam String newRole) {
        try {
            userService.updateUserRole(userId, newRole);
            return new ResponseEntity<>("User role updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating user role: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/user/{userId}/lock")
    public ResponseEntity<String> updateAccountLockStatus(@PathVariable Long userId, @RequestParam boolean lock) {
        try {
            userService.updateAccountLockStatus(userId, lock);
            String status = lock ? "locked" : "unlocked";
            return new ResponseEntity<>("User account " + status + " successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating lock status: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/user/{userId}/enable")
    public ResponseEntity<String> updateAccountEnabledStatus(@PathVariable Long userId, @RequestParam boolean enabled) {

        try {
            userService.updateAccountEnabledStatus(userId, enabled);
            String status = enabled ? "enabled" : "disabled";
            return new ResponseEntity<>("User account " + status + " successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating enabled status: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/user/{userId}/account-expiry")
    public ResponseEntity<String> updateAccountExpiryStatus(@PathVariable Long userId, @RequestParam boolean expire) {

        try {
            userService.updateAccountExpiryStatus(userId, expire);
            String status = expire ? "expired" : "not expired";
            return new ResponseEntity<>("User account set to " + status + " successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating account expiry: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/user/{userId}/credentials-expiry")
    public ResponseEntity<String> updateCredentialsExpiryStatus(@PathVariable Long userId, @RequestParam boolean expire) {
        try {
            userService.updateCredentialsExpiryStatus(userId, expire);
            String status = expire ? "expired" : "not expired";
            return new ResponseEntity<>("User credentials set to " + status + " successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating credentials expiry: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        try {
            return new ResponseEntity<>(userService.getAllRoles(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Activity Management Endpoints
    @PostMapping("/activities/cleanup")
    public ResponseEntity<String> performActivityCleanup() {
        try {
            int deletedCount = activityCleanupService.performManualCleanup();
            return new ResponseEntity<>("Activity cleanup completed. Deleted " + deletedCount + " activities.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error during activity cleanup: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/activities/stats")
    public ResponseEntity<ActivityCleanupService.ActivityCleanupStats> getActivityStats() {
        try {
            ActivityCleanupService.ActivityCleanupStats stats = activityCleanupService.getCleanupStats();
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
