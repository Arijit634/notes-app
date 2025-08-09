package com.project.notes_backend.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;

public interface NoteService {

    NoteResponseDTO createNoteForUser(String username, NoteRequestDTO noteRequest);

    NoteResponseDTO updateNoteForUser(Long noteId, NoteRequestDTO noteRequest, String username);

    void deleteNoteForUser(Long noteId, String username);

    Page<NoteResponseDTO> getNotesForUser(String username, String search, String category, boolean shared, String sortBy, String sortOrder, Pageable pageable);

    NoteResponseDTO getNoteByIdForUser(Long noteId, String username);

    Page<NoteResponseDTO> searchUserNotes(String username, String query, Pageable pageable);

    Map<String, Object> getUserNotesStats(String username);

    NoteResponseDTO toggleFavorite(Long noteId, String username);

    Page<NoteResponseDTO> getFavoriteNotes(String username, Pageable pageable);

    Page<NoteResponseDTO> getPublicNotes(Pageable pageable);
}
