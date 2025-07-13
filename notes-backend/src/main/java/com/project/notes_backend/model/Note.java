package com.project.notes_backend.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notes", indexes = {
    @Index(name = "idx_notes_owner", columnList = "owner_id"),
    @Index(name = "idx_notes_created", columnList = "created_at"),
    @Index(name = "idx_notes_title", columnList = "title")
})
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    @Column(columnDefinition = "TEXT")
    private String content;

    @Size(max = 100, message = "Title cannot exceed 100 characters")
    @Column(length = 100)
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    @Size(max = 50, message = "Category cannot exceed 50 characters")
    @Column(length = 50)
    private String category;

    // Proper relationship with User entity instead of primitive username
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private User owner;

    // Legacy field for backward compatibility - will be deprecated
    @Column(name = "owner_username")
    @Deprecated(since = "2.0", forRemoval = true)
    private String ownerUsername;

    @Column(name = "is_shared", nullable = false)
    private boolean isShared = false;

    @Column(name = "share_count", nullable = false)
    private int shareCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Convenience constructor for backward compatibility
    public Note(String content, User owner) {
        this.content = content;
        this.owner = owner;
        this.ownerUsername = owner.getUserName(); // For backward compatibility
    }

    // Helper method to get owner username
    public String getOwnerUsername() {
        if (owner != null) {
            return owner.getUserName();
        }
        return ownerUsername; // Fallback for legacy data
    }
}
