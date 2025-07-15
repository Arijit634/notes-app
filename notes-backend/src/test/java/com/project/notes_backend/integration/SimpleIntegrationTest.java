package com.project.notes_backend.integration;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.service.NoteService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SimpleIntegrationTest {

    @Autowired
    private NoteService noteService;

    @Autowired
    private NoteRepository noteRepository;

    @Test
    void testApplicationContextLoads() {
        // Test that the application context loads successfully
        assertThat(noteService).isNotNull();
        assertThat(noteRepository).isNotNull();
    }

    @Test
    void testNoteRepositoryIsWiredCorrectly() {
        // Test basic repository functionality
        long initialCount = noteRepository.count();
        assertThat(initialCount).isGreaterThanOrEqualTo(0);
    }

    @Test
    void testServiceLayerExists() {
        // Test that key services are available
        assertThat(noteService).isNotNull();
    }
}
