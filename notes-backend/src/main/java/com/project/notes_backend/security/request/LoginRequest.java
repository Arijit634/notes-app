package com.project.notes_backend.security.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginRequest {

    private String username; // Can be either username or email
    private String password;
}
