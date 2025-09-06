package com.project.notes_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponseDTO {
    private ProfileResponseDTO profile;
    private String newToken; // New JWT token if username was changed
    private String message;
}
