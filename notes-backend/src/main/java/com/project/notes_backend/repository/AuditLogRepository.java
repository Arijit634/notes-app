package com.project.notes_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.notes_backend.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByNoteId(Long noteId);
}
