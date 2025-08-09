package com.project.notes_backend.service.impl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.project.notes_backend.model.UserActivity;
import com.project.notes_backend.repository.UserActivityRepository;
import com.project.notes_backend.service.UserActivityService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserActivityServiceImpl implements UserActivityService {

    @Autowired
    private UserActivityRepository userActivityRepository;

    @Override
    public void logActivity(String username, UserActivity.ActivityType action, String resourceType,
            Long resourceId, String resourceTitle) {
        logActivity(username, action, resourceType, resourceId, resourceTitle, null);
    }

    @Override
    public void logActivity(String username, UserActivity.ActivityType action, String resourceType,
            Long resourceId, String resourceTitle, String description) {
        try {
            UserActivity activity = new UserActivity(username, action, resourceType, resourceId, resourceTitle, description);
            userActivityRepository.save(activity);

            log.debug("Logged activity: {} {} {} for user: {}", action, resourceType, resourceId, username);
        } catch (Exception e) {
            log.error("Failed to log activity for user: {}, action: {}, error: {}", username, action, e.getMessage());
        }
    }

    @Override
    public Page<UserActivity> getUserActivities(String username, Pageable pageable) {
        log.info("Fetching activities for user: {}", username);
        return userActivityRepository.findByUsernameOrderByTimestampDesc(username, pageable);
    }

    @Override
    public Page<UserActivity> getRecentActivities(String username, int days, Pageable pageable) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        log.info("Fetching recent activities for user: {} since: {}", username, since);
        return userActivityRepository.findRecentActivities(username, since, pageable);
    }

    @Override
    public void cleanupOldActivities(int daysToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        log.info("Cleaning up activities older than: {}", cutoff);
        userActivityRepository.deleteActivitiesOlderThan(cutoff);
    }
}
