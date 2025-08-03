package com.project.notes_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.notes_backend.dto.PasswordChangeRequestDTO;
import com.project.notes_backend.dto.ProfileResponseDTO;
import com.project.notes_backend.dto.ProfileUpdateRequestDTO;
import com.project.notes_backend.dto.TwoFactorSetupDTO;
import com.project.notes_backend.dto.TwoFactorVerificationDTO;
import com.project.notes_backend.service.ProfileService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/profile")
@Slf4j
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Get current user's profile
     */
    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        ProfileResponseDTO profile = profileService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    /**
     * Update current user's profile
     */
    @PutMapping
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @Valid @RequestBody ProfileUpdateRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            ProfileResponseDTO updatedProfile = profileService.updateProfile(userDetails.getUsername(), request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            log.error("Failed to update profile for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Change password
     */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody PasswordChangeRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            profileService.changePassword(userDetails.getUsername(), request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            log.error("Failed to change password for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Setup 2FA - Generate QR code and secret
     */
    @PostMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupDTO> setupTwoFactor(
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            TwoFactorSetupDTO setup = profileService.setupTwoFactor(userDetails.getUsername());
            return ResponseEntity.ok(setup);
        } catch (Exception e) {
            log.error("Failed to setup 2FA for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Verify and enable 2FA
     */
    @PostMapping("/2fa/verify")
    public ResponseEntity<String> verifyAndEnableTwoFactor(
            @Valid @RequestBody TwoFactorVerificationDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            boolean verified = profileService.verifyAndEnableTwoFactor(userDetails.getUsername(), request);
            if (verified) {
                return ResponseEntity.ok("2FA enabled successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid verification code");
            }
        } catch (Exception e) {
            log.error("Failed to verify 2FA for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Disable 2FA
     */
    @PostMapping("/2fa/disable")
    public ResponseEntity<String> disableTwoFactor(
            @Valid @RequestBody TwoFactorVerificationDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            boolean disabled = profileService.disableTwoFactor(userDetails.getUsername(), request);
            if (disabled) {
                return ResponseEntity.ok("2FA disabled successfully");
            } else {
                return ResponseEntity.badRequest().body("Invalid verification code");
            }
        } catch (Exception e) {
            log.error("Failed to disable 2FA for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Upload profile picture
     */
    @PostMapping("/picture")
    public ResponseEntity<String> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String profilePictureUrl = profileService.uploadProfilePicture(userDetails.getUsername(), file);
            return ResponseEntity.ok(profilePictureUrl);
        } catch (Exception e) {
            log.error("Failed to upload profile picture for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete profile picture
     */
    @DeleteMapping("/picture")
    public ResponseEntity<String> deleteProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            profileService.deleteProfilePicture(userDetails.getUsername());
            return ResponseEntity.ok("Profile picture deleted successfully");
        } catch (Exception e) {
            log.error("Failed to delete profile picture for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Serve profile pictures
     */
    @GetMapping("/picture/{filename}")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, "profile-pictures", filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            log.error("Failed to serve profile picture: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
