package com.project.notes_backend.service;

import org.springframework.web.multipart.MultipartFile;

import com.project.notes_backend.dto.PasswordChangeRequestDTO;
import com.project.notes_backend.dto.ProfileResponseDTO;
import com.project.notes_backend.dto.ProfileUpdateRequestDTO;
import com.project.notes_backend.dto.TwoFactorSetupDTO;
import com.project.notes_backend.dto.TwoFactorVerificationDTO;

public interface ProfileService {

    ProfileResponseDTO getUserProfile(String username);

    ProfileResponseDTO updateProfile(String username, ProfileUpdateRequestDTO request);

    void changePassword(String username, PasswordChangeRequestDTO request);

    TwoFactorSetupDTO setupTwoFactor(String username);

    boolean verifyAndEnableTwoFactor(String username, TwoFactorVerificationDTO request);

    boolean disableTwoFactor(String username, TwoFactorVerificationDTO request);

    String uploadProfilePicture(String username, MultipartFile file);

    void deleteProfilePicture(String username);
}
