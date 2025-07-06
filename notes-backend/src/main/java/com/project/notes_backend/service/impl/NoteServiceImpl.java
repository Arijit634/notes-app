package com.project.notes_backend.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.notes_backend.model.Note;
import com.project.notes_backend.repository.NoteRepository;
import com.project.notes_backend.service.NoteService;

@Service
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Override
    public Note createNoteForUser(String userName, String content) {
        Note note = new Note();
        note.setContent(content);
        note.setOwnerUsername(userName);
        return noteRepository.save(note);
    }

    @Override
    public Note updateNoteForUser(String userName, Long noteId, String content) {
        Note note = noteRepository.findById(noteId).orElseThrow(() -> new RuntimeException("No such note found"));
        note.setContent(content);
        note.setOwnerUsername(userName);
        return noteRepository.save(note);
    }

    @Override
    public void deleteNoteForUser(String userName, Long noteId) {
        // noteRepository.findById(noteId).orElseThrow(() -> new RuntimeException("No such note found"));
        noteRepository.deleteById(noteId);
    }

    @Override
    public List<Note> getNotesForUser(String userName) {
        List<Note> personalNotes = noteRepository.findByOwnerUsername(userName);
        return personalNotes;
    }

}
