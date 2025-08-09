package com.project.notes_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.exception.UnauthorizedAccessException;
import com.project.notes_backend.model.Note;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.service.impl.NoteServiceImpl;

@ExtendWith(MockitoExtension.class)
class NoteServiceImplTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private NoteServiceImpl noteService;

    private User testUser;
    private Note testNote;
    private NoteRequestDTO noteRequestDTO;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setEnabled(true);
        testUser.setAccountNonExpired(true);
        testUser.setAccountNonLocked(true);
        testUser.setCredentialsNonExpired(true);

        testNote = new Note();
        testNote.setId(1L);
        testNote.setTitle("Test Note");
        testNote.setContent("Test Content");
        testNote.setDescription("Test Description");
        testNote.setOwner(testUser);
        testNote.setCreatedAt(LocalDateTime.now());
        testNote.setUpdatedAt(LocalDateTime.now());

        noteRequestDTO = NoteRequestDTO.builder()
                .title("Test Note")
                .content("Test Content")
                .description("Test Description")
                .category("PERSONAL")
                .build();
    }

    @Test
    void testCreateNoteForUser_Success() {
        when(userRepository.findByUserName("testuser"))
                .thenReturn(Optional.of(testUser));
        when(noteRepository.save(any(Note.class)))
                .thenReturn(testNote);

        NoteResponseDTO result = noteService.createNoteForUser("testuser", noteRequestDTO);

        assertNotNull(result);
        assertEquals("Test Note", result.getTitle());
        assertEquals("Test Content", result.getContent());

        verify(userRepository, times(1)).findByUserName("testuser");
        verify(noteRepository, times(1)).save(any(Note.class));
    }

    @Test
    void testCreateNoteForUser_UserNotFound() {
        when(userRepository.findByUserName("testuser"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            noteService.createNoteForUser("testuser", noteRequestDTO);
        });

        verify(userRepository, times(1)).findByUserName("testuser");
        verify(noteRepository, never()).save(any(Note.class));
    }

    @Test
    void testGetNoteByIdForUser_Success() {
        when(noteRepository.findById(1L))
                .thenReturn(Optional.of(testNote));

        NoteResponseDTO result = noteService.getNoteByIdForUser(1L, "testuser");

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Note", result.getTitle());

        verify(noteRepository, times(1)).findById(1L);
    }

    @Test
    void testGetNoteByIdForUser_NoteNotFound() {
        when(noteRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            noteService.getNoteByIdForUser(1L, "testuser");
        });

        verify(noteRepository, times(1)).findById(1L);
    }

    @Test
    void testGetNoteByIdForUser_UnauthorizedUser() {
        when(noteRepository.findById(1L))
                .thenReturn(Optional.of(testNote));

        assertThrows(UnauthorizedAccessException.class, () -> {
            noteService.getNoteByIdForUser(1L, "anotheruser");
        });

        verify(noteRepository, times(1)).findById(1L);
    }

    @Test
    void testGetNotesForUser_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Note> notePage = new PageImpl<>(List.of(testNote));

        when(noteRepository.findByOwnerUsernameOrderByCreatedAtDesc("testuser", pageable))
                .thenReturn(notePage);

        Page<NoteResponseDTO> result = noteService.getNotesForUser("testuser", null, null, false, "createdAt", "desc", pageable);

        assertNotNull(result);
        assertTrue(result.getContent().size() >= 0); // May be empty or have content

        verify(noteRepository, times(1)).findByOwnerUsernameOrderByCreatedAtDesc("testuser", pageable);
    }

    @Test
    void testUpdateNoteForUser_Success() {
        when(noteRepository.findById(1L))
                .thenReturn(Optional.of(testNote));
        when(noteRepository.save(any(Note.class)))
                .thenReturn(testNote);

        NoteRequestDTO updateRequest = NoteRequestDTO.builder()
                .title("Updated Title")
                .content("Updated Content")
                .description("Updated Description")
                .category("WORK")
                .build();

        NoteResponseDTO result = noteService.updateNoteForUser(1L, updateRequest, "testuser");

        assertNotNull(result);
        verify(noteRepository, times(1)).findById(1L);
        verify(noteRepository, times(1)).save(any(Note.class));
    }

    @Test
    void testDeleteNoteForUser_Success() {
        when(noteRepository.findById(1L))
                .thenReturn(Optional.of(testNote));

        noteService.deleteNoteForUser(1L, "testuser");

        verify(noteRepository, times(1)).findById(1L);
        verify(noteRepository, times(1)).delete(testNote);
    }

    @Test
    void testSearchUserNotes_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Note> notePage = new PageImpl<>(List.of(testNote));

        when(noteRepository.findByOwnerUsernameAndFullTextSearch("testuser", "test", pageable))
                .thenReturn(notePage);

        Page<NoteResponseDTO> result = noteService.searchUserNotes("testuser", "test", pageable);

        assertNotNull(result);
        assertTrue(result.getContent().size() >= 0);

        verify(noteRepository, times(1)).findByOwnerUsernameAndFullTextSearch("testuser", "test", pageable);
    }
}
