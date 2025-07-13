package com.project.notes_backend.service;

import java.util.List;

import com.project.notes_backend.model.AuditLog;
import com.project.notes_backend.model.Note;

public interface AuditLogService {

    void logNoteCreation(String username, Note note);

    void logNoteUpdate(String username, Note note);

    void logNoteDeletion(String username, Long noteId);

    List<AuditLog> getAllAuditLogs();

    List<AuditLog> getAuditLogsForNoteId(Long id);
}
