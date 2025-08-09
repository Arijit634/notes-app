package com.project.notes_backend.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteResponseDTO {

    private Long id;
    private String content;
    private String title;
    private String description;
    private String ownerUsername;
    private String authorName; // alias for ownerUsername
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @JsonProperty("shared")
    private boolean isShared;
    private int shareCount;
    @JsonProperty("favorite")
    private boolean isFavorite;
    @JsonProperty("public")
    private boolean isPublic;
}
