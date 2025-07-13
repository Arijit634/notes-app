package com.project.notes_backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.service.NoteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/notes")
@Validated
public class NoteController {

    @Autowired
    private NoteService noteService;

    /**
     * Create a new note for the authenticated user
     */
    @PostMapping
    public ResponseEntity<NoteResponseDTO> createNote(
            @Valid @RequestBody NoteRequestDTO noteRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        NoteResponseDTO createdNote = noteService.createNoteForUser(userDetails.getUsername(), noteRequest);
        return new ResponseEntity<>(createdNote, HttpStatus.CREATED);
    }

    /**
     * Get paginated list of user's notes with optional search
     */
    @GetMapping
    public ResponseEntity<Page<NoteResponseDTO>> getUserNotes(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        Page<NoteResponseDTO> notes = noteService.getNotesForUser(userDetails.getUsername(), search, pageable);
        return ResponseEntity.ok(notes);
    }

    /**
     * Get a specific note by ID
     */
    @GetMapping("/{noteId}")
    public ResponseEntity<NoteResponseDTO> getNoteById(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails) {

        NoteResponseDTO note = noteService.getNoteByIdForUser(noteId, userDetails.getUsername());
        return ResponseEntity.ok(note);
    }

    /**
     * Update an existing note
     */
    @PutMapping("/{noteId}")
    public ResponseEntity<NoteResponseDTO> updateNote(
            @PathVariable Long noteId,
            @Valid @RequestBody NoteRequestDTO noteRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        NoteResponseDTO updatedNote = noteService.updateNoteForUser(noteId, noteRequest, userDetails.getUsername());
        return ResponseEntity.ok(updatedNote);
    }

    /**
     * Delete a note by ID
     */
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails) {

        noteService.deleteNoteForUser(noteId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get user's notes statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotesStats(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> stats = noteService.getUserNotesStats(userDetails.getUsername());
        return ResponseEntity.ok(stats);
    }

    /**
     * Search notes by content, title, or description
     */
    @GetMapping("/search")
    public ResponseEntity<Page<NoteResponseDTO>> searchNotes(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        Page<NoteResponseDTO> notes = noteService.searchUserNotes(userDetails.getUsername(), query, pageable);
        return ResponseEntity.ok(notes);
    }
}
