package com.project.notes_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.model.AuditLog;
import com.project.notes_backend.service.AuditLogService;

@RestController
@RequestMapping("/audit")
public class AuditLogController {

    @Autowired
    AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<AuditLog> getAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }

    @GetMapping("/note/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<AuditLog> getNoteAuditLogs(@PathVariable Long id) {
        return auditLogService.getAuditLogsForNoteId(id);
    }

}
