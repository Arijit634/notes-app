package com.project.notes_backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDTO {

    private Long userId;
    private String userName;
    private String email;
    private String phoneNumber;
    private String profilePicture;
    private boolean isTwoFactorEnabled;
    private String signUpMethod;
    private boolean accountNonLocked;
    private boolean accountNonExpired;
    private boolean credentialsNonExpired;
    private boolean enabled;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String roleName;
}
