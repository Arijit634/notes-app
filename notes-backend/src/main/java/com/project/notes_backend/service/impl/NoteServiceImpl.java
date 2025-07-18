package com.project.notes_backend.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.exception.UnauthorizedAccessException;
import com.project.notes_backend.model.Note;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.service.AuditLogService;
import com.project.notes_backend.service.NoteService;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    @CacheEvict(value = "userNotes", allEntries = true)
    public NoteResponseDTO createNoteForUser(String username, NoteRequestDTO noteRequest) {
        log.info("Creating note for user: {}", username);

        User user = getUserByUsername(username);

        Note note = new Note();
        note.setContent(noteRequest.getContent());
        note.setTitle(noteRequest.getTitle());
        note.setDescription(noteRequest.getDescription());
        note.setCategory(noteRequest.getCategory());
        note.setOwner(user);
        note.setOwnerUsername(username); // For backward compatibility

        Note savedNote = noteRepository.save(note);
        auditLogService.logNoteCreation(username, savedNote);

        log.info("Note created successfully with ID: {} for user: {}", savedNote.getId(), username);
        return convertToResponseDTO(savedNote);
    }

    @Override
    @Cacheable(value = "userNotes", key = "#username + '_' + #search + '_' + #pageable.pageNumber")
    @Transactional(readOnly = true)
    public Page<NoteResponseDTO> getNotesForUser(String username, String search, Pageable pageable) {
        log.debug("Fetching notes for user: {} with search: {}", username, search);

        Page<Note> notes;
        if (StringUtils.hasText(search)) {
            notes = noteRepository.findByOwnerUsernameAndSearch(username, search, pageable);
        } else {
            notes = noteRepository.findByOwnerUsernameOrderByCreatedAtDesc(username, pageable);
        }

        return notes.map(this::convertToResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public NoteResponseDTO getNoteByIdForUser(Long noteId, String username) {
        log.debug("Fetching note ID: {} for user: {}", noteId, username);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        validateNoteOwnership(note, username);
        return convertToResponseDTO(note);
    }

    @Override
    @CacheEvict(value = "userNotes", allEntries = true)
    public NoteResponseDTO updateNoteForUser(Long noteId, NoteRequestDTO noteRequest, String username) {
        log.info("Updating note ID: {} for user: {}", noteId, username);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        validateNoteOwnership(note, username);

        // Update fields
        note.setContent(noteRequest.getContent());
        note.setTitle(noteRequest.getTitle());
        note.setDescription(noteRequest.getDescription());
        note.setCategory(noteRequest.getCategory());

        Note updatedNote = noteRepository.save(note);
        auditLogService.logNoteUpdate(username, updatedNote);

        log.info("Note updated successfully: ID {} for user: {}", noteId, username);
        return convertToResponseDTO(updatedNote);
    }

    @Override
    @CacheEvict(value = "userNotes", allEntries = true)
    public void deleteNoteForUser(Long noteId, String username) {
        log.info("Deleting note ID: {} for user: {}", noteId, username);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        validateNoteOwnership(note, username);

        auditLogService.logNoteDeletion(username, noteId);
        noteRepository.delete(note);

        log.info("Note deleted successfully: ID {} for user: {}", noteId, username);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NoteResponseDTO> searchUserNotes(String username, String query, Pageable pageable) {
        log.debug("Searching notes for user: {} with query: {}", username, query);

        Page<Note> notes = noteRepository.findByOwnerUsernameAndFullTextSearch(username, query, pageable);
        return notes.map(this::convertToResponseDTO);
    }

    @Override
    @Cacheable(value = "userStats", key = "#username")
    @Transactional(readOnly = true)
    public Map<String, Object> getUserNotesStats(String username) {
        log.debug("Calculating stats for user: {}", username);

        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        long totalNotes = noteRepository.countByOwnerUsername(username);
        long notesThisMonth = noteRepository.countByOwnerUsernameAndCreatedAtAfter(
                username, LocalDateTime.now().minusMonths(1));

        // Content statistics
        Double avgContentLength = noteRepository.getAverageContentLengthByOwnerUsername(username);
        Long totalCharacters = noteRepository.getTotalCharactersByOwnerUsername(username);

        // Recent activity
        LocalDateTime lastActivity = noteRepository.getLastActivityByOwnerUsername(username);

        stats.put("totalNotes", totalNotes);
        stats.put("notesThisMonth", notesThisMonth);
        stats.put("averageContentLength", avgContentLength != null ? Math.round(avgContentLength) : 0);
        stats.put("totalCharacters", totalCharacters != null ? totalCharacters : 0L);
        stats.put("lastActivity", lastActivity);
        stats.put("hasNotes", totalNotes > 0);

        return stats;
    }

    /**
     * Convert Note entity to NoteResponseDTO
     */
    private NoteResponseDTO convertToResponseDTO(Note note) {
        NoteResponseDTO dto = new NoteResponseDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setTitle(note.getTitle());
        dto.setDescription(note.getDescription());
        dto.setCategory(note.getCategory());
        dto.setOwnerUsername(note.getOwnerUsername());
        dto.setAuthorName(note.getOwnerUsername()); // Set authorName same as ownerUsername
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        dto.setShared(note.isShared());
        dto.setShareCount(note.getShareCount());
        return dto;
    }

    /**
     * Get user by username with error handling
     */
    private User getUserByUsername(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    /**
     * Validate that the note belongs to the specified user
     */
    private void validateNoteOwnership(Note note, String username) {
        if (!note.getOwnerUsername().equals(username)) {
            throw new UnauthorizedAccessException("Access denied: You can only access your own notes");
        }
    }
}
