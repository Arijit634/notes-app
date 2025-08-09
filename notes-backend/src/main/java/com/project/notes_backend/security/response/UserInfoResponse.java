package com.project.notes_backend.security.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserInfoResponse {

    private Long id;
    private String userName;  // Changed to match frontend expectation
    private String email;
    private boolean accountNonLocked;
    private boolean accountNonExpired;
    private boolean credentialsNonExpired;
    private boolean enabled;
    private LocalDate credentialsExpiryDate;
    private LocalDate accountExpiryDate;
    private boolean isTwoFactorEnabled;
    private List<String> roles;
    private String profilePicture;  // Added for frontend
    private String signUpMethod;    // Added for frontend

    public UserInfoResponse(Long id, String userName, String email, boolean accountNonLocked, boolean accountNonExpired,
            boolean credentialsNonExpired, boolean enabled, LocalDate credentialsExpiryDate,
            LocalDate accountExpiryDate, boolean isTwoFactorEnabled, List<String> roles,
            String profilePicture, String signUpMethod) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.accountNonLocked = accountNonLocked;
        this.accountNonExpired = accountNonExpired;
        this.credentialsNonExpired = credentialsNonExpired;
        this.enabled = enabled;
        this.credentialsExpiryDate = credentialsExpiryDate;
        this.accountExpiryDate = accountExpiryDate;
        this.isTwoFactorEnabled = isTwoFactorEnabled;
        this.roles = roles;
        this.profilePicture = profilePicture;
        this.signUpMethod = signUpMethod;
    }
}
