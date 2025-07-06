package com.project.notes_backend.service;

import java.util.List;

import com.project.notes_backend.model.Note;

public interface NoteService {

    Note createNoteForUser(String userName, String content);

    Note updateNoteForUser(String userName, Long noteId, String content);

    void deleteNoteForUser(String userName, Long noteId);

    List<Note> getNotesForUser(String userName);

}
