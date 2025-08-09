package com.project.notes_backend.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.project.notes_backend.dto.PasswordChangeRequestDTO;
import com.project.notes_backend.dto.ProfileResponseDTO;
import com.project.notes_backend.dto.ProfileUpdateRequestDTO;
import com.project.notes_backend.dto.TwoFactorSetupDTO;
import com.project.notes_backend.dto.TwoFactorVerificationDTO;
import com.project.notes_backend.exception.ResourceNotFoundException;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.service.ProfileService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base.url:http://localhost:5000}")
    private String baseUrl;

    private final GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDTO getUserProfile(String username) {
        log.info("Fetching profile for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        return convertToProfileResponseDTO(user);
    }

    @Override
    public ProfileResponseDTO updateProfile(String username, ProfileUpdateRequestDTO request) {
        log.info("Updating profile for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Update fields if provided
        if (StringUtils.hasText(request.getUserName()) && !request.getUserName().equals(user.getUserName())) {
            // Check if new username is available
            if (userRepository.existsByUserName(request.getUserName())) {
                throw new RuntimeException("Username already exists: " + request.getUserName());
            }
            user.setUserName(request.getUserName());
        }

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())) {
            // Check if new email is available
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (StringUtils.hasText(request.getProfilePicture())) {
            user.setProfilePicture(request.getProfilePicture());
        }

        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", username);

        return convertToProfileResponseDTO(savedUser);
    }

    @Override
    public void changePassword(String username, PasswordChangeRequestDTO request) {
        log.info("Changing password for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);
    }

    @Override
    public TwoFactorSetupDTO setupTwoFactor(String username) {
        log.info("Setting up 2FA for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Generate new secret key
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        String secretKey = key.getKey();

        // Generate QR code URL
        String qrCodeUrl = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
                "Notes App",
                user.getEmail(),
                key
        );

        // Store the secret temporarily (not enabled yet)
        user.setTwoFactorSecret(secretKey);
        userRepository.save(user);

        log.info("2FA setup initiated for user: {}", username);

        return new TwoFactorSetupDTO(secretKey, qrCodeUrl, secretKey);
    }

    @Override
    public boolean verifyAndEnableTwoFactor(String username, TwoFactorVerificationDTO request) {
        log.info("Verifying and enabling 2FA for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!StringUtils.hasText(user.getTwoFactorSecret())) {
            throw new RuntimeException("2FA setup not initiated. Please setup 2FA first.");
        }

        // Verify the code - handle potential parsing issues
        try {
            String codeStr = request.getVerificationCode().trim();
            // Remove any non-digit characters
            codeStr = codeStr.replaceAll("[^0-9]", "");

            if (codeStr.length() != 6) {
                log.warn("Invalid 2FA code length for user: {}, length: {}", username, codeStr.length());
                return false;
            }

            int code = Integer.parseInt(codeStr);
            boolean isValid = googleAuthenticator.authorize(user.getTwoFactorSecret(), code);

            if (isValid) {
                user.setTwoFactorEnabled(true);
                userRepository.save(user);
                log.info("2FA enabled successfully for user: {}", username);
                return true;
            } else {
                log.warn("Invalid 2FA code provided for user: {}", username);
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("Failed to parse 2FA code for user: {}, code: {}", username, request.getVerificationCode(), e);
            return false;
        }
    }

    @Override
    public boolean disableTwoFactor(String username, TwoFactorVerificationDTO request) {
        log.info("Disabling 2FA for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA is not enabled for this user");
        }

        // Verify the code before disabling
        boolean isValid = googleAuthenticator.authorize(user.getTwoFactorSecret(),
                Integer.parseInt(request.getVerificationCode()));

        if (isValid) {
            user.setTwoFactorEnabled(false);
            user.setTwoFactorSecret(null); // Clear the secret
            userRepository.save(user);
            log.info("2FA disabled successfully for user: {}", username);
            return true;
        } else {
            log.warn("Invalid 2FA code provided for user: {}", username);
            return false;
        }
    }

    @Override
    public String uploadProfilePicture(String username, MultipartFile file) {
        log.info("Uploading profile picture for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size should not exceed 5MB");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "profile-pictures");
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = username + "_" + UUID.randomUUID().toString() + fileExtension;

            // Delete old profile picture if exists
            if (StringUtils.hasText(user.getProfilePicture())) {
                deleteOldProfilePicture(user.getProfilePicture());
            }

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user profile picture URL
            String profilePictureUrl = baseUrl + "/api/profile/picture/" + newFilename;
            user.setProfilePicture(profilePictureUrl);
            userRepository.save(user);

            log.info("Profile picture uploaded successfully for user: {}", username);
            return profilePictureUrl;

        } catch (IOException e) {
            log.error("Failed to upload profile picture for user: {}", username, e);
            throw new RuntimeException("Failed to upload profile picture: " + e.getMessage());
        }
    }

    @Override
    public void deleteProfilePicture(String username) {
        log.info("Deleting profile picture for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (StringUtils.hasText(user.getProfilePicture())) {
            deleteOldProfilePicture(user.getProfilePicture());
            user.setProfilePicture(null);
            userRepository.save(user);
            log.info("Profile picture deleted successfully for user: {}", username);
        }
    }

    private void deleteOldProfilePicture(String profilePictureUrl) {
        try {
            if (profilePictureUrl != null && profilePictureUrl.contains("/api/profile/picture/")) {
                String filename = profilePictureUrl.substring(profilePictureUrl.lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDir, "profile-pictures", filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete old profile picture: {}", e.getMessage());
        }
    }

    private ProfileResponseDTO convertToProfileResponseDTO(User user) {
        ProfileResponseDTO dto = new ProfileResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setUserName(user.getUserName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setTwoFactorEnabled(user.isTwoFactorEnabled());
        dto.setSignUpMethod(user.getSignUpMethod());
        dto.setAccountNonLocked(user.isAccountNonLocked());
        dto.setAccountNonExpired(user.isAccountNonExpired());
        dto.setCredentialsNonExpired(user.isCredentialsNonExpired());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedDate(user.getCreatedDate());
        dto.setUpdatedDate(user.getUpdatedDate());
        dto.setRoleName(user.getRole() != null ? user.getRole().getRoleName().name() : null);
        return dto;
    }
}
