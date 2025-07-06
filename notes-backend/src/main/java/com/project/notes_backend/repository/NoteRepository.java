package com.project.notes_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.notes_backend.model.Note;

public interface NoteRepository extends JpaRepository<Note, Long> {

    // Custom query methods can be defined here if needed
    // For example, to find notes by owner username:
    List<Note> findByOwnerUsername(String ownerUsername);

    // Additional methods can be added as required
}
