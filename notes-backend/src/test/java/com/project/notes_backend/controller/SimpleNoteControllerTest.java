package com.project.notes_backend.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.service.NoteService;

/**
 * Simple Web Layer Tests for EnhancedNoteController
 */
@WebMvcTest(controllers = com.project.notes_backend.controller.NoteController.class)
@ActiveProfiles("test")
class SimpleNoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NoteService noteService;

    @Autowired
    private ObjectMapper objectMapper;

    private NoteRequestDTO noteRequestDTO;
    private NoteResponseDTO noteResponseDTO;

    @BeforeEach
    void setUp() {
        noteRequestDTO = NoteRequestDTO.builder()
                .title("Test Note")
                .content("Test Content")
                .description("Test Description")
                .category("WORK")
                .build();

        noteResponseDTO = NoteResponseDTO.builder()
                .id(1L)
                .title("Test Note")
                .content("Test Content")
                .description("Test Description")
                .category("WORK")
                .ownerUsername("testuser")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .isShared(false)
                .shareCount(0)
                .build();
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void createNote_ShouldReturnCreatedNote() throws Exception {
        // Given
        when(noteService.createNoteForUser(eq("testuser"), any(NoteRequestDTO.class)))
                .thenReturn(noteResponseDTO);

        // When & Then
        mockMvc.perform(post("/api/v1/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteRequestDTO))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Test Note"))
                .andExpect(jsonPath("$.content").value("Test Content"));

        verify(noteService).createNoteForUser(eq("testuser"), any(NoteRequestDTO.class));
    }
}
