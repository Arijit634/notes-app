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
import com.project.notes_backend.dto.ProfileUpdateResponseDTO;
import com.project.notes_backend.dto.TwoFactorSetupDTO;
import com.project.notes_backend.dto.TwoFactorVerificationDTO;
import com.project.notes_backend.exception.ResourceNotFoundException;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.security.UserDetailsImpl;
import com.project.notes_backend.security.jwt.JwtUtils;
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

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private JwtUtils jwtUtils;

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
    public ProfileUpdateResponseDTO updateProfile(String username, ProfileUpdateRequestDTO request) {
        log.info("Updating profile for user: {}", username);

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        boolean usernameChanged = false;
        String newToken = null;

        // Update fields if provided
        if (StringUtils.hasText(request.getUserName()) && !request.getUserName().equals(user.getUserName())) {
            // Check if new username is available
            if (userRepository.existsByUserName(request.getUserName())) {
                throw new RuntimeException("User with that username already exists");
            }
            
            String oldUsername = user.getUserName();
            String newUsername = request.getUserName();
            
            // Update user's username
            user.setUserName(newUsername);
            usernameChanged = true;
            
            // CRITICAL FIX: Update all notes' ownerUsername field to maintain consistency
            log.info("Updating notes ownerUsername from '{}' to '{}' for user ID: {}", oldUsername, newUsername, user.getUserId());
            int updatedNotes = noteRepository.updateOwnerUsername(oldUsername, newUsername);
            log.info("Updated {} notes with new username", updatedNotes);
        }

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())) {
            // Check if new email is available
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("User with that email already exists");
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

        // Generate new JWT token if username was changed
        if (usernameChanged) {
            UserDetailsImpl userDetails = UserDetailsImpl.build(savedUser);
            newToken = jwtUtils.generateTokenFromUsername(userDetails);
            log.info("Generated new JWT token for updated username: {}", savedUser.getUserName());
        }

        log.info("Profile updated successfully for user: {}", username);

        ProfileResponseDTO profileResponse = convertToProfileResponseDTO(savedUser);
        String message = usernameChanged ? "Profile updated successfully. Please use your new username for future logins." 
                                         : "Profile updated successfully";
        
        return new ProfileUpdateResponseDTO(profileResponse, newToken, message);
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
        log.info("Uploading profile picture for user: {} - File size: {} bytes, Content type: {}",
                username, file.getSize(), file.getContentType());

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        // Log detailed file information for debugging
        log.debug("Original filename: {}, Size: {} MB", file.getOriginalFilename(), file.getSize() / (1024.0 * 1024.0));

        // Validate file type - be more lenient with mobile uploads
        String contentType = file.getContentType();
        if (contentType == null) {
            log.warn("Content type is null, checking file extension");
            String filename = file.getOriginalFilename();
            if (filename != null) {
                String ext = filename.toLowerCase();
                if (!ext.endsWith(".jpg") && !ext.endsWith(".jpeg") && !ext.endsWith(".png")
                        && !ext.endsWith(".gif") && !ext.endsWith(".webp") && !ext.endsWith(".heic")) {
                    throw new RuntimeException("Only image files are allowed (jpg, jpeg, png, gif, webp, heic)");
                }
            } else {
                throw new RuntimeException("Unable to determine file type");
            }
        } else if (!contentType.startsWith("image/") && !contentType.equals("application/octet-stream")) {
            // Allow application/octet-stream as some mobile browsers send this for images
            throw new RuntimeException("Only image files are allowed. Received: " + contentType);
        }

        // Validate file size (10MB max for mobile compatibility)
        long maxSize = 10 * 1024 * 1024; // Increased to 10MB for mobile photos
        if (file.getSize() > maxSize) {
            log.warn("File size {} exceeds maximum allowed size {}", file.getSize(), maxSize);
            throw new RuntimeException("File size should not exceed 10MB");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "profile-pictures");
            Files.createDirectories(uploadPath);

            // Generate unique filename with proper extension handling
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = ".jpg"; // Default to jpg
            if (originalFilename != null && originalFilename.contains(".")) {
                String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
                // Convert HEIC to jpg for better compatibility
                if (ext.equals(".heic") || ext.equals(".heif")) {
                    fileExtension = ".jpg";
                } else if (ext.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                    fileExtension = ext;
                }
            }

            String newFilename = username + "_" + UUID.randomUUID().toString() + fileExtension;
            log.info("Generated filename: {}", newFilename);

            // Delete old profile picture if exists
            if (StringUtils.hasText(user.getProfilePicture())) {
                deleteOldProfilePicture(user.getProfilePicture());
            }

            // Save file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("File saved successfully at: {}", filePath.toString());

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
