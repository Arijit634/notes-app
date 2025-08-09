package com.project.notes_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.model.UserActivity;
import com.project.notes_backend.service.UserActivityService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestController {

    @Autowired
    private UserActivityService userActivityService;

    @PostMapping("/delete-activity")
    public ResponseEntity<String> testDeleteActivity(
            @RequestParam Long noteId,
            @RequestParam String noteTitle,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            log.info("Test: Logging delete activity for note: {} by user: {}", noteId, userDetails.getUsername());
            userActivityService.logActivity(userDetails.getUsername(), UserActivity.ActivityType.DELETED, "note",
                    noteId, noteTitle);
            log.info("Test: Successfully logged delete activity");
            return ResponseEntity.ok("Delete activity logged successfully");
        } catch (Exception e) {
            log.error("Test: Failed to log delete activity: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to log delete activity: " + e.getMessage());
        }
    }
}
