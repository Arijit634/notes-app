package com.project.notes_backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.notes_backend.dto.NoteRequestDTO;
import com.project.notes_backend.dto.NoteResponseDTO;
import com.project.notes_backend.service.NoteService;
import com.project.notes_backend.security.jwt.JwtUtils;
import com.project.notes_backend.security.UserDetailsServiceImpl;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@WebMvcTest(NoteController.class)
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NoteService noteService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

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
                .category("PERSONAL")
                .build();

        noteResponseDTO = NoteResponseDTO.builder()
                .id(1L)
                .title("Test Note")
                .content("Test Content")
                .description("Test Description")
                .category("PERSONAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .authorName("testuser")
                .ownerUsername("testuser")
                .build();
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCreateNote() throws Exception {
        when(noteService.createNoteForUser(eq("testuser"), any(NoteRequestDTO.class)))
                .thenReturn(noteResponseDTO);

        mockMvc.perform(post("/api/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteRequestDTO))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Note"))
                .andExpect(jsonPath("$.content").value("Test Content"));

        verify(noteService, times(1)).createNoteForUser(eq("testuser"), any(NoteRequestDTO.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetNoteById() throws Exception {
        when(noteService.getNoteByIdForUser(1L, "testuser"))
                .thenReturn(noteResponseDTO);

        mockMvc.perform(get("/api/notes/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Note"));

        verify(noteService, times(1)).getNoteByIdForUser(1L, "testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetAllNotes() throws Exception {
        Page<NoteResponseDTO> notePage = new PageImpl<>(List.of(noteResponseDTO));

        when(noteService.getNotesForUser(eq("testuser"), isNull(), any(PageRequest.class)))
                .thenReturn(notePage);

        mockMvc.perform(get("/api/notes?page=0&size=10")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Note"));

        verify(noteService, times(1)).getNotesForUser(eq("testuser"), isNull(), any(PageRequest.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testSearchNotes() throws Exception {
        Page<NoteResponseDTO> notePage = new PageImpl<>(List.of(noteResponseDTO));

        when(noteService.searchUserNotes(eq("testuser"), eq("test"), any(PageRequest.class)))
                .thenReturn(notePage);

        mockMvc.perform(get("/api/notes/search?query=test&page=0&size=10")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Note"));

        verify(noteService, times(1)).searchUserNotes(eq("testuser"), eq("test"), any(PageRequest.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testUpdateNote() throws Exception {
        when(noteService.updateNoteForUser(eq(1L), any(NoteRequestDTO.class), eq("testuser")))
                .thenReturn(noteResponseDTO);

        mockMvc.perform(put("/api/notes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteRequestDTO))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Note"));

        verify(noteService, times(1)).updateNoteForUser(eq(1L), any(NoteRequestDTO.class), eq("testuser"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testDeleteNote() throws Exception {
        doNothing().when(noteService).deleteNoteForUser(1L, "testuser");

        mockMvc.perform(delete("/api/notes/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(noteService, times(1)).deleteNoteForUser(1L, "testuser");
    }
}
