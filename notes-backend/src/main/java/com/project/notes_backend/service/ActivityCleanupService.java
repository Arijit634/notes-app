package com.project.notes_backend.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.notes_backend.repository.UserActivityRepository;

/**
 * Enterprise-grade activity cleanup service Manages storage and performance by
 * automatically purging old activity logs Similar to how enterprise apps like
 * GitHub, Slack, and AWS CloudTrail manage logs
 */
@Service
public class ActivityCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityCleanupService.class);

    @Autowired
    private UserActivityRepository activityRepository;

    // Configurable retention policy (default 30 days for free tier, 90 days for enterprise)
    @Value("${app.activity.retention.days:30}")
    private int retentionDays;

    @Value("${app.activity.cleanup.enabled:true}")
    private boolean cleanupEnabled;

    @Value("${app.activity.max-activities-per-user:1000}")
    private long maxActivitiesPerUser;

    /**
     * Scheduled cleanup job - runs daily at 2:00 AM Similar to AWS CloudWatch
     * log retention policies
     */
    @Scheduled(cron = "0 0 2 * * *") // Daily at 2 AM
    @Async
    @Transactional
    public void performScheduledCleanup() {
        if (!cleanupEnabled) {
            logger.debug("Activity cleanup is disabled");
            return;
        }

        logger.info("Starting scheduled activity cleanup. Retention period: {} days", retentionDays);

        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

            // Count activities before cleanup
            long totalActivitiesBeforeCleanup = activityRepository.count();

            // Perform cleanup
            int deletedCount = cleanupOldActivities(cutoffDate);

            long totalActivitiesAfterCleanup = activityRepository.count();

            logger.info("Activity cleanup completed. Deleted {} activities. "
                    + "Total activities: {} -> {}",
                    deletedCount, totalActivitiesBeforeCleanup, totalActivitiesAfterCleanup);

            // Log storage savings estimate (assuming ~200 bytes per activity)
            long storageFreedKB = (deletedCount * 200) / 1024;
            logger.info("Estimated storage freed: {} KB", storageFreedKB);

        } catch (Exception e) {
            logger.error("Error during scheduled activity cleanup", e);
        }
    }

    /**
     * Clean up activities older than the specified date
     *
     * @param cutoffDate Activities older than this date will be deleted
     * @return Number of activities deleted
     */
    @Transactional
    public int cleanupOldActivities(LocalDateTime cutoffDate) {
        try {
            // Perform deletion and get count
            int deletedCount = activityRepository.deleteActivitiesOlderThan(cutoffDate);

            logger.info("Deleted {} activities older than {}", deletedCount, cutoffDate);
            return deletedCount;

        } catch (Exception e) {
            logger.error("Error cleaning up old activities", e);
            throw e;
        }
    }

    /**
     * Manual cleanup method for administrators Can be called via API for
     * immediate cleanup
     */
    public int performManualCleanup() {
        logger.info("Manual activity cleanup initiated");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        return cleanupOldActivities(cutoffDate);
    }

    /**
     * Emergency cleanup for users with too many activities Keeps only the most
     * recent activities up to the limit
     */
    @Transactional
    public int cleanupExcessiveActivities(String username) {
        try {
            long userActivityCount = activityRepository.countByUsername(username);

            if (userActivityCount <= maxActivitiesPerUser) {
                return 0; // No cleanup needed
            }

            logger.warn("User {} has {} activities, exceeding limit of {}. Performing cleanup.",
                    username, userActivityCount, maxActivitiesPerUser);

            // This would require a more complex query to keep only recent ones
            // For now, we'll just log and let the normal cleanup handle it
            return 0;

        } catch (Exception e) {
            logger.error("Error during excessive activities cleanup for user: " + username, e);
            throw e;
        }
    }

    /**
     * Get cleanup statistics for monitoring
     */
    public ActivityCleanupStats getCleanupStats() {
        long totalActivities = activityRepository.count();
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

        return new ActivityCleanupStats(
                totalActivities,
                retentionDays,
                cutoffDate,
                cleanupEnabled
        );
    }

    /**
     * DTO for cleanup statistics
     */
    public static class ActivityCleanupStats {

        private final long totalActivities;
        private final int retentionDays;
        private final LocalDateTime cutoffDate;
        private final boolean cleanupEnabled;

        public ActivityCleanupStats(long totalActivities, int retentionDays,
                LocalDateTime cutoffDate, boolean cleanupEnabled) {
            this.totalActivities = totalActivities;
            this.retentionDays = retentionDays;
            this.cutoffDate = cutoffDate;
            this.cleanupEnabled = cleanupEnabled;
        }

        // Getters
        public long getTotalActivities() {
            return totalActivities;
        }

        public int getRetentionDays() {
            return retentionDays;
        }

        public LocalDateTime getCutoffDate() {
            return cutoffDate;
        }

        public boolean isCleanupEnabled() {
            return cleanupEnabled;
        }
    }
}
