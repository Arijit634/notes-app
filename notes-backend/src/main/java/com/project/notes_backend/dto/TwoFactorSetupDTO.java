package com.project.notes_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupDTO {

    private String secretKey;
    private String qrCodeUrl;
    private String manualEntryKey;
}
