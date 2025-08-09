package com.project.notes_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.notes_backend.model.UserActivity;

public interface UserActivityService {

    void logActivity(String username, UserActivity.ActivityType action, String resourceType,
            Long resourceId, String resourceTitle);

    void logActivity(String username, UserActivity.ActivityType action, String resourceType,
            Long resourceId, String resourceTitle, String description);

    Page<UserActivity> getUserActivities(String username, Pageable pageable);

    Page<UserActivity> getRecentActivities(String username, int days, Pageable pageable);

    void cleanupOldActivities(int daysToKeep);
}
