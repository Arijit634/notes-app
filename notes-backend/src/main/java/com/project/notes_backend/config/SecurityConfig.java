package com.project.notes_backend.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.project.notes_backend.filter.RateLimitingFilter;
import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.RoleRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.security.jwt.AuthEntryPointJwt;
import com.project.notes_backend.security.jwt.AuthTokenFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true,
        securedEnabled = true,
        jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    @Lazy
    OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        // Configure CORS
        http.cors(cors -> cors.configurationSource(corsConfigurationSource));

        // Disable CSRF for stateless REST API using JWT tokens
        http.csrf(csrf -> csrf.disable());

        // Configure session management for stateless REST API
        http.sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests((requests)
                -> requests
                        // Public authentication endpoints - must be first
                        .requestMatchers("/auth/public/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/auth/public/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/login**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        // Profile picture serving endpoint - public access
                        .requestMatchers("/api/profile/picture/**").permitAll()
                        // H2 Console for database access
                        .requestMatchers("/h2-console/**").permitAll()
                        // Swagger/OpenAPI documentation endpoints
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()
                        .requestMatchers("/api-docs").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        // Admin endpoints
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/audit/**").hasAuthority("ADMIN")
                        // All other requests require authentication
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> {
                    oauth2.successHandler(oAuth2LoginSuccessHandler);
                    oauth2.failureUrl("/auth/public/login?error=oauth2_failed");
                });

        http.exceptionHandling(exception
                -> exception.authenticationEntryPoint(unauthorizedHandler));

        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(authenticationJwtTokenFilter(),
                UsernamePasswordAuthenticationFilter.class);

        // Disable form login for REST API
        http.formLogin(form -> form.disable());
        http.httpBasic(withDefaults());

        // Enable H2 console in frames
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initData(RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            roleRepository.findByRoleName(AppRole.USER)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.USER)));

            Role adminRole = roleRepository.findByRoleName(AppRole.ADMIN)
                    .orElseGet(() -> roleRepository.save(new Role(AppRole.ADMIN)));

            //     if (!userRepository.existsByUserName("user1")) {
            //         User user1 = new User("user1", "user1@example.com",
            //                 passwordEncoder.encode("password1"));
            //         user1.setAccountNonLocked(false);
            //         user1.setAccountNonExpired(true);
            //         user1.setCredentialsNonExpired(true);
            //         user1.setEnabled(true);
            //         user1.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
            //         user1.setAccountExpiryDate(LocalDate.now().plusYears(1));
            //         user1.setTwoFactorEnabled(false);
            //         user1.setSignUpMethod("email");
            //         user1.setRole(userRole);
            //         userRepository.save(user1);
            //     }
            if (!userRepository.existsByUserName("admin")) {
                User admin = new User("admin", "admin@example.com",
                        passwordEncoder.encode("adminPass"));
                admin.setAccountNonLocked(true);
                admin.setAccountNonExpired(true);
                admin.setCredentialsNonExpired(true);
                admin.setEnabled(true);
                admin.setCredentialsExpiryDate(LocalDate.now().plusYears(1));
                admin.setAccountExpiryDate(LocalDate.now().plusYears(1));
                admin.setTwoFactorEnabled(false);
                admin.setSignUpMethod("email");
                admin.setRole(adminRole);
                userRepository.save(admin);
            }
        };
    }
}
