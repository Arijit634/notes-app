package com.project.notes_backend.model;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class NoteTest {

    @Test
    void testNoteConstructorWithContentAndOwner() {
        // Given
        User owner = new User("testuser", "test@example.com");
        String content = "Test content";

        // When
        Note note = new Note(content, owner);

        // Then
        assertEquals(content, note.getContent());
        assertEquals(owner, note.getOwner());
        assertEquals("testuser", note.getOwnerUsername());
        assertFalse(note.isShared());
        assertEquals(0, note.getShareCount());
    }

    @Test
    void testNoteSettersAndGetters() {
        // Given
        Note note = new Note();
        LocalDateTime now = LocalDateTime.now();
        User owner = new User("newuser", "new@example.com");

        // When
        note.setId(1L);
        note.setTitle("Updated Title");
        note.setContent("Updated content");
        note.setCategory("personal");
        note.setDescription("Updated description");
        note.setOwner(owner);
        note.setShared(true);
        note.setShareCount(5);
        note.setCreatedAt(now);
        note.setUpdatedAt(now);

        // Then
        assertEquals(1L, note.getId());
        assertEquals("Updated Title", note.getTitle());
        assertEquals("Updated content", note.getContent());
        assertEquals("personal", note.getCategory());
        assertEquals("Updated description", note.getDescription());
        assertEquals(owner, note.getOwner());
        assertEquals("newuser", note.getOwnerUsername());
        assertTrue(note.isShared());
        assertEquals(5, note.getShareCount());
        assertEquals(now, note.getCreatedAt());
        assertEquals(now, note.getUpdatedAt());
    }

    @Test
    void testNoteEqualsAndHashCode() {
        // Given
        Note note1 = new Note();
        note1.setId(1L);
        note1.setTitle("Test");

        Note note2 = new Note();
        note2.setId(1L);
        note2.setTitle("Test");

        Note note3 = new Note();
        note3.setId(2L);
        note3.setTitle("Different");

        // Then
        assertEquals(note1, note2);
        assertNotEquals(note1, note3);
        assertEquals(note1.hashCode(), note2.hashCode());

        // Test self equality
        assertEquals(note1, note1);

        // Test null and different class
        assertNotEquals(note1, null);
        assertNotEquals(note1, "string");
    }

    @Test
    void testNoteToString() {
        // Given
        Note note = new Note();
        note.setId(1L);
        note.setTitle("Test Note");

        // When
        String noteString = note.toString();

        // Then
        assertNotNull(noteString);
        assertTrue(noteString.contains("Test Note"));
    }

    @Test
    void testNoteDefaultValues() {
        // When
        Note note = new Note();

        // Then
        assertNull(note.getId());
        assertNull(note.getTitle());
        assertNull(note.getContent());
        assertNull(note.getCategory());
        assertNull(note.getDescription());
        assertNull(note.getOwner());
        assertFalse(note.isShared());
        assertEquals(0, note.getShareCount());
        assertNull(note.getCreatedAt());
        assertNull(note.getUpdatedAt());
    }

    @Test
    void testGetOwnerUsernameWithoutOwner() {
        // Given
        Note note = new Note();
        note.setOwnerUsername("legacyuser");

        // When
        String ownerUsername = note.getOwnerUsername();

        // Then
        assertEquals("legacyuser", ownerUsername);
    }

    @Test
    void testGetOwnerUsernameWithOwner() {
        // Given
        User owner = new User("currentuser", "current@example.com");
        Note note = new Note();
        note.setOwner(owner);

        // When
        String ownerUsername = note.getOwnerUsername();

        // Then
        assertEquals("currentuser", ownerUsername);
    }
}
