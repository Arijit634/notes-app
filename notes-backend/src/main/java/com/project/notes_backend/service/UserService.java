package com.project.notes_backend.service;

import java.util.List;

import com.project.notes_backend.dto.UserDTO;
import com.project.notes_backend.model.User;

public interface UserService {

    List<User> getAllUsers();

    UserDTO getUserById(Long id);

    void updateUserRole(Long id, String newRole);
}
