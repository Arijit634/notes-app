package com.project.notes_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple controller to handle favicon requests and prevent log noise
 * This is optional for REST API backends
 */
@RestController
public class FaviconController {

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        // Return 204 No Content to browsers requesting favicon
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
