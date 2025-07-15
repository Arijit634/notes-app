package com.project.notes_backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import com.project.notes_backend.model.Note;

@DataJpaTest
@ActiveProfiles("test")
class SimpleNoteRepositoryTest {

    @Autowired
    private NoteRepository noteRepository;

    @Test
    void testFindAll() {
        // Act
        Page<Note> notes = noteRepository.findAll(PageRequest.of(0, 10));

        // Assert
        assertThat(notes).isNotNull();
        assertThat(notes.getContent()).isNotNull();
    }

    @Test
    void testRepositoryExists() {
        // Simply test that the repository is wired correctly
        assertThat(noteRepository).isNotNull();
    }
}
