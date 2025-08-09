package com.project.notes_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.model.UserActivity;
import com.project.notes_backend.service.UserActivityService;

@RestController
@RequestMapping("/api/activities")
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    /**
     * Get user activities with pagination
     */
    @GetMapping
    public ResponseEntity<Page<UserActivity>> getUserActivities(
            @PageableDefault(size = 20, sort = "timestamp", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        Page<UserActivity> activities = userActivityService.getUserActivities(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(activities);
    }

    /**
     * Get recent activities (last N days) - optimized for dashboard
     */
    @GetMapping("/recent")
    public ResponseEntity<Page<UserActivity>> getRecentActivities(
            @RequestParam(defaultValue = "7") int days,
            @PageableDefault(size = 10, sort = "timestamp", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Limit days to reasonable values for performance
        int limitedDays = Math.min(days, 30); // Max 30 days

        Page<UserActivity> activities = userActivityService.getRecentActivities(userDetails.getUsername(), limitedDays, pageable);
        return ResponseEntity.ok(activities);
    }
}
