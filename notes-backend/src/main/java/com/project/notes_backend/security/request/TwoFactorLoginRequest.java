package com.project.notes_backend.security.request;

public class TwoFactorLoginRequest {

    private String username;
    private String verificationCode;

    public TwoFactorLoginRequest() {
    }

    public TwoFactorLoginRequest(String username, String verificationCode) {
        this.username = username;
        this.verificationCode = verificationCode;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
}
