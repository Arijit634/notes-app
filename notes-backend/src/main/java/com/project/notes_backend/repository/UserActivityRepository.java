package com.project.notes_backend.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.notes_backend.model.UserActivity;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    // Get user activities with pagination, ordered by timestamp desc
    Page<UserActivity> findByUsernameOrderByTimestampDesc(String username, Pageable pageable);

    // Get recent activities (last 30 days)
    @Query("SELECT ua FROM UserActivity ua WHERE ua.username = :username AND ua.timestamp >= :since ORDER BY ua.timestamp DESC")
    Page<UserActivity> findRecentActivities(@Param("username") String username,
            @Param("since") LocalDateTime since,
            Pageable pageable);

    // Delete old activities (for cleanup) and return count
    @Modifying
    @Query("DELETE FROM UserActivity ua WHERE ua.timestamp < :before")
    int deleteActivitiesOlderThan(@Param("before") LocalDateTime before);

    // Count activities by user
    long countByUsername(String username);
}
