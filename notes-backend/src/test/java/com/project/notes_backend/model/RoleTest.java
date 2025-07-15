package com.project.notes_backend.model;

import org.junit.jupiter.api.Test;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RoleTest {

    @Test
    void testRoleConstructorWithAppRole() {
        // When
        Role role = new Role(AppRole.USER);

        // Then
        assertEquals(AppRole.USER, role.getRoleName());
        assertNotNull(role.getUsers());
        assertTrue(role.getUsers().isEmpty());
    }

    @Test
    void testRoleSettersAndGetters() {
        // Given
        Role role = new Role();
        Set<User> users = new HashSet<>();
        User user = new User();
        users.add(user);

        // When
        role.setRoleId(1);
        role.setRoleName(AppRole.ADMIN);
        role.setUsers(users);

        // Then
        assertEquals(1, role.getRoleId());
        assertEquals(AppRole.ADMIN, role.getRoleName());
        assertEquals(users, role.getUsers());
        assertEquals(1, role.getUsers().size());
        assertTrue(role.getUsers().contains(user));
    }

    @Test
    void testRoleEqualsAndHashCode() {
        // Given
        Role role1 = new Role();
        role1.setRoleId(1);
        role1.setRoleName(AppRole.USER);

        Role role2 = new Role();
        role2.setRoleId(1);
        role2.setRoleName(AppRole.USER);

        Role role3 = new Role();
        role3.setRoleId(2);
        role3.setRoleName(AppRole.ADMIN);

        // Then
        assertEquals(role1, role2);
        assertNotEquals(role1, role3);
        assertEquals(role1.hashCode(), role2.hashCode());
    }

    @Test
    void testAppRoleEnumValues() {
        // Test all enum values exist
        assertEquals("USER", AppRole.USER.name());
        assertEquals("ADMIN", AppRole.ADMIN.name());
        assertEquals("MODERATOR", AppRole.MODERATOR.name());

        // Test valueOf
        assertEquals(AppRole.USER, AppRole.valueOf("USER"));
        assertEquals(AppRole.ADMIN, AppRole.valueOf("ADMIN"));
        assertEquals(AppRole.MODERATOR, AppRole.valueOf("MODERATOR"));
    }

    @Test
    void testRoleUsersBidirectionalRelationship() {
        // Given
        Role role = new Role(AppRole.USER);
        User user1 = new User("user1", "user1@example.com");
        User user2 = new User("user2", "user2@example.com");

        Set<User> users = new HashSet<>();
        users.add(user1);
        users.add(user2);

        // When
        role.setUsers(users);
        user1.setRole(role);
        user2.setRole(role);

        // Then
        assertEquals(2, role.getUsers().size());
        assertTrue(role.getUsers().contains(user1));
        assertTrue(role.getUsers().contains(user2));
        assertEquals(role, user1.getRole());
        assertEquals(role, user2.getRole());
    }
}
