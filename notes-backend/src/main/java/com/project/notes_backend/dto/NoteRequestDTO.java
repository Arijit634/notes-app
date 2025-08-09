package com.project.notes_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequestDTO {

    @NotBlank(message = "Content cannot be blank")
    @Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    private String content;

    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Builder.Default
    private Boolean isFavorite = false;

    @Builder.Default
    private Boolean isPublic = false;
}
