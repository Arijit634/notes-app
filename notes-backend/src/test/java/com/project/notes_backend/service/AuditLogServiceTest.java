package com.project.notes_backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.project.notes_backend.model.AuditLog;
import com.project.notes_backend.model.Note;
import com.project.notes_backend.repository.AuditLogRepository;
import com.project.notes_backend.service.impl.AuditLogServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    private Note testNote;
    private AuditLog testAuditLog;

    @BeforeEach
    void setUp() {
        testNote = new Note();
        testNote.setId(1L);
        testNote.setTitle("Test Note");
        testNote.setContent("Test content");

        testAuditLog = new AuditLog();
        testAuditLog.setId(1L);
        testAuditLog.setAction("CREATE");
        testAuditLog.setUsername("testuser");
        testAuditLog.setNoteId(1L);
        testAuditLog.setNoteContent("Test content");
        testAuditLog.setTimestamp(LocalDateTime.now());
    }

    @Test
    void testLogNoteCreation() {
        // Given
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        // When
        auditLogService.logNoteCreation("testuser", testNote);

        // Then
        verify(auditLogRepository).save(argThat(log
                -> "CREATE".equals(log.getAction())
                && "testuser".equals(log.getUsername())
                && Long.valueOf(1L).equals(log.getNoteId())
                && "Test content".equals(log.getNoteContent())
                && log.getTimestamp() != null
        ));
    }

    @Test
    void testLogNoteUpdate() {
        // Given
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        // When
        auditLogService.logNoteUpdate("testuser", testNote);

        // Then
        verify(auditLogRepository).save(argThat(log
                -> "UPDATE".equals(log.getAction())
                && "testuser".equals(log.getUsername())
                && Long.valueOf(1L).equals(log.getNoteId())
                && "Test content".equals(log.getNoteContent())
                && log.getTimestamp() != null
        ));
    }

    @Test
    void testLogNoteDeletion() {
        // Given
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(testAuditLog);

        // When
        auditLogService.logNoteDeletion("testuser", 1L);

        // Then
        verify(auditLogRepository).save(argThat(log
                -> "DELETE".equals(log.getAction())
                && "testuser".equals(log.getUsername())
                && Long.valueOf(1L).equals(log.getNoteId())
                && log.getTimestamp() != null
        ));
    }

    @Test
    void testGetAllAuditLogs() {
        // Given
        List<AuditLog> logs = List.of(testAuditLog);
        when(auditLogRepository.findAll()).thenReturn(logs);

        // When
        List<AuditLog> result = auditLogService.getAllAuditLogs();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAction()).isEqualTo("CREATE");
        verify(auditLogRepository).findAll();
    }

    @Test
    void testGetAuditLogsForNoteId() {
        // Given
        List<AuditLog> logs = List.of(testAuditLog);
        when(auditLogRepository.findByNoteId(1L)).thenReturn(logs);

        // When
        List<AuditLog> result = auditLogService.getAuditLogsForNoteId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNoteId()).isEqualTo(1L);
        verify(auditLogRepository).findByNoteId(1L);
    }
}
