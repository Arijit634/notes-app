package com.project.notes_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;

@Configuration
public class OAuth2Config {

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        return new CustomOAuth2UserService();
    }

    /**
     * Custom OAuth2 User Service to handle different providers
     */
    public static class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

        private final OAuth2UserService<OAuth2UserRequest, OAuth2User> defaultService
                = new org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService();

        @Override
        public OAuth2User loadUser(OAuth2UserRequest userRequest) {
            return defaultService.loadUser(userRequest);
        }
    }
}
