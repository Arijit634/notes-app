package com.project.notes_backend.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.exception.UnauthorizedAccessException;
import com.project.notes_backend.model.Note;
import com.project.notes_backend.model.User;
import com.project.notes_backend.model.UserActivity;
import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.service.AuditLogService;
import com.project.notes_backend.service.NoteService;
import com.project.notes_backend.service.UserActivityService;

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

    @Autowired
    private UserActivityService userActivityService;

    @Override
    @CacheEvict(value = {"userNotes", "userStats"}, allEntries = true)
    public NoteResponseDTO createNoteForUser(String username, NoteRequestDTO noteRequest) {
        log.info("Creating note for user: {}", username);

        User user = getUserByUsername(username);

        Note note = new Note();
        note.setContent(noteRequest.getContent());
        note.setTitle(noteRequest.getTitle());
        note.setDescription(noteRequest.getDescription());
        note.setCategory(noteRequest.getCategory());
        note.setFavorite(noteRequest.getIsFavorite() != null ? noteRequest.getIsFavorite() : false);
        note.setIsPublic(noteRequest.getIsPublic() != null ? noteRequest.getIsPublic() : false);
        note.setOwner(user);
        note.setOwnerUsername(username); // For backward compatibility

        Note savedNote = noteRepository.save(note);
        auditLogService.logNoteCreation(username, savedNote);

        // Log user activity
        userActivityService.logActivity(username, UserActivity.ActivityType.CREATED, "note",
                savedNote.getId(), savedNote.getTitle() != null ? savedNote.getTitle() : "Untitled Note");

        log.info("Note created successfully with ID: {} for user: {}", savedNote.getId(), username);
        return convertToResponseDTO(savedNote);
    }

    @Override
    @Cacheable(value = "userNotes", key = "#username + '_' + #search + '_' + #category + '_' + #shared + '_' + #sortBy + '_' + #sortOrder + '_' + #pageable.pageNumber")
    @Transactional(readOnly = true)
    public Page<NoteResponseDTO> getNotesForUser(String username, String search, String category, boolean shared, String sortBy, String sortOrder, Pageable pageable) {
        log.debug("Fetching notes for user: {} with search: {} category: {} shared: {} sortBy: {} sortOrder: {}",
                username, search, category, shared, sortBy, sortOrder);

        // Create custom sort based on sortBy and sortOrder
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortOrder)
                ? org.springframework.data.domain.Sort.Direction.DESC
                : org.springframework.data.domain.Sort.Direction.ASC,
                sortBy
        );

        // Create new pageable with custom sort
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        Page<Note> notes;
        if (StringUtils.hasText(search) && StringUtils.hasText(category)) {
            // Both search and category filter
            notes = noteRepository.findByOwnerUsernameAndCategoryAndSearch(username, category, search, sortedPageable);
        } else if (StringUtils.hasText(search)) {
            // Only search filter
            notes = noteRepository.findByOwnerUsernameAndSearch(username, search, sortedPageable);
        } else if (StringUtils.hasText(category)) {
            // Only category filter
            notes = noteRepository.findByOwnerUsernameAndCategory(username, category, sortedPageable);
        } else if (shared) {
            // Only shared filter
            notes = noteRepository.findByOwnerUsernameAndIsSharedTrue(username, sortedPageable);
        } else {
            // No filters
            notes = noteRepository.findByOwnerUsername(username, sortedPageable);
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
    @CacheEvict(value = {"userNotes", "userStats"}, allEntries = true)
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
        note.setFavorite(noteRequest.getIsFavorite() != null ? noteRequest.getIsFavorite() : note.isFavorite());
        note.setIsPublic(noteRequest.getIsPublic() != null ? noteRequest.getIsPublic() : note.getIsPublic());

        Note updatedNote = noteRepository.save(note);
        auditLogService.logNoteUpdate(username, updatedNote);

        // Log user activity
        userActivityService.logActivity(username, UserActivity.ActivityType.UPDATED, "note",
                updatedNote.getId(), updatedNote.getTitle() != null ? updatedNote.getTitle() : "Untitled Note");

        log.info("Note updated successfully: ID {} for user: {}", noteId, username);
        return convertToResponseDTO(updatedNote);
    }

    @Override
    @CacheEvict(value = {"userNotes", "userStats"}, allEntries = true)
    public void deleteNoteForUser(Long noteId, String username) {
        log.info("Deleting note ID: {} for user: {}", noteId, username);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        validateNoteOwnership(note, username);

        // Store note info before deletion for activity logging
        String noteTitle = note.getTitle();
        Long noteIdForActivity = note.getId();

        // Log user activity for deletion BEFORE deleting the note
        try {
            log.info("Logging delete activity for note: {} by user: {}", noteIdForActivity, username);
            userActivityService.logActivity(username, UserActivity.ActivityType.DELETED, "note",
                    noteIdForActivity, noteTitle);
            log.info("Successfully logged delete activity for note: {} by user: {}", noteIdForActivity, username);
        } catch (Exception e) {
            log.error("Failed to log delete activity for note: {} by user: {}, error: {}", noteIdForActivity, username, e.getMessage());
        }

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
        long notesThisWeek = noteRepository.countByOwnerUsernameAndCreatedAtAfter(
                username, LocalDateTime.now().minusWeeks(1));
        long notesThisMonth = noteRepository.countByOwnerUsernameAndCreatedAtAfter(
                username, LocalDateTime.now().minusMonths(1));

        // Content statistics
        Double avgContentLength = noteRepository.getAverageContentLengthByOwnerUsername(username);
        Long totalCharacters = noteRepository.getTotalCharactersByOwnerUsername(username);

        // Recent activity
        LocalDateTime lastActivity = noteRepository.getLastActivityByOwnerUsername(username);

        stats.put("totalNotes", totalNotes);
        stats.put("notesThisWeek", notesThisWeek);
        stats.put("notesThisMonth", notesThisMonth);
        stats.put("averageContentLength", avgContentLength != null ? Math.round(avgContentLength) : 0);
        stats.put("totalCharacters", totalCharacters != null ? totalCharacters : 0L);
        stats.put("lastActivity", lastActivity);
        stats.put("hasNotes", totalNotes > 0);

        log.debug("Returning stats: {}", stats);
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

        // Fetch user profile information for display
        try {
            User noteOwner = userRepository.findByUserName(note.getOwnerUsername()).orElse(null);
            if (noteOwner != null) {
                // Use username as display name (since no firstName/lastName fields exist)
                dto.setAuthorDisplayName(noteOwner.getUserName());

                // Set profile picture URL (if available)
                dto.setAuthorProfilePicture(noteOwner.getProfilePicture());
            } else {
                // Fallback if user not found
                dto.setAuthorDisplayName(note.getOwnerUsername());
                dto.setAuthorProfilePicture(null);
            }
        } catch (Exception e) {
            // Fallback in case of any error
            log.warn("Failed to fetch user profile for note owner: {}", note.getOwnerUsername(), e);
            dto.setAuthorDisplayName(note.getOwnerUsername());
            dto.setAuthorProfilePicture(null);
        }

        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        dto.setShared(note.isShared());
        dto.setShareCount(note.getShareCount());
        dto.setFavorite(note.isFavorite());
        dto.setPublic(note.getIsPublic() != null && note.getIsPublic());
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

    @Override
    @CacheEvict(value = {"userNotes", "userStats"}, allEntries = true)
    public NoteResponseDTO toggleFavorite(Long noteId, String username) {
        log.info("Toggling favorite status for note: {} by user: {}", noteId, username);

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        validateNoteOwnership(note, username);

        // Toggle the favorite status
        note.setFavorite(!note.isFavorite());
        note.setUpdatedAt(LocalDateTime.now());

        Note savedNote = noteRepository.save(note);

        // Log the action - using the existing pattern from other methods
        auditLogService.logNoteUpdate(username, savedNote);

        // Log user activity
        UserActivity.ActivityType activityType = savedNote.isFavorite()
                ? UserActivity.ActivityType.FAVORITED : UserActivity.ActivityType.UNFAVORITED;
        userActivityService.logActivity(username, activityType, "note",
                savedNote.getId(), savedNote.getTitle() != null ? savedNote.getTitle() : "Untitled Note");

        return convertToResponseDTO(savedNote);
    }

    @Override
    public Page<NoteResponseDTO> getFavoriteNotes(String username, Pageable pageable) {
        log.info("Fetching favorite notes for user: {}", username);

        Page<Note> favoriteNotes = noteRepository.findByOwnerUsernameAndIsFavoriteTrue(username, pageable);

        return favoriteNotes.map(this::convertToResponseDTO);
    }

    @Override
    public Page<NoteResponseDTO> getPublicNotes(Pageable pageable) {
        log.info("Fetching public notes");

        Page<Note> publicNotes = noteRepository.findByIsPublicTrue(pageable);

        return publicNotes.map(this::convertToResponseDTO);
    }
}
