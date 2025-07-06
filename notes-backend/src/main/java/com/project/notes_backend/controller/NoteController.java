package com.project.notes_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.notes_backend.model.Note;
import com.project.notes_backend.service.NoteService;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @PostMapping
    public Note createNote(@RequestBody String content,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        System.out.println("User details: " + userName);
        return noteService.createNoteForUser(userName, content);
    }

    @GetMapping
    public List<Note> getUserNotes(@AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        return noteService.getNotesForUser(userName);
    }

    @PutMapping("/{noteId}")
    public Note updateNote(@PathVariable Long noteId, @RequestBody String content,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        return noteService.updateNoteForUser(userName, noteId, content);
    }

    @DeleteMapping("/{noteId}")
    public String deleteNote(@PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userName = userDetails.getUsername();
        noteService.deleteNoteForUser(userName, noteId);
        return "Note has been successfully deleted";

    }

}
