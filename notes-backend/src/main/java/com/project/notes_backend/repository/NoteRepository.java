package com.project.notes_backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.notes_backend.model.Note;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    // Basic queries with pagination
    Page<Note> findByOwnerUsernameOrderByCreatedAtDesc(String ownerUsername, Pageable pageable);
    
    Page<Note> findByOwnerUsername(String ownerUsername, Pageable pageable);

    List<Note> findByOwnerUsername(String ownerUsername);

    // Category filtering
    Page<Note> findByOwnerUsernameAndCategory(String ownerUsername, String category, Pageable pageable);
    
    // Shared notes
    Page<Note> findByOwnerUsernameAndIsSharedTrue(String ownerUsername, Pageable pageable);

    // Search queries
    @Query("SELECT n FROM Note n WHERE n.ownerUsername = :username AND "
            + "(LOWER(n.content) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Note> findByOwnerUsernameAndSearch(@Param("username") String username,
            @Param("search") String search,
            Pageable pageable);

    // Category + Search combination
    @Query("SELECT n FROM Note n WHERE n.ownerUsername = :username AND "
            + "(:category IS NULL OR n.category = :category) AND "
            + "(LOWER(n.content) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Note> findByOwnerUsernameAndCategoryAndSearch(@Param("username") String username,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    // Full-text search (more comprehensive)
    @Query("SELECT n FROM Note n WHERE n.ownerUsername = :username AND "
            + "(LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) OR "
            + "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR "
            + "LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%'))) "
            + "ORDER BY n.updatedAt DESC")
    Page<Note> findByOwnerUsernameAndFullTextSearch(@Param("username") String username,
            @Param("query") String query,
            Pageable pageable);

    // Statistics queries
    long countByOwnerUsername(String ownerUsername);

    @Query("SELECT COUNT(n) FROM Note n WHERE n.ownerUsername = :username AND n.createdAt > :afterDate")
    long countByOwnerUsernameAndCreatedAtAfter(@Param("username") String username,
            @Param("afterDate") LocalDateTime afterDate);

    @Query("SELECT AVG(LENGTH(n.content)) FROM Note n WHERE n.ownerUsername = :username")
    Double getAverageContentLengthByOwnerUsername(@Param("username") String username);

    @Query("SELECT SUM(LENGTH(n.content)) FROM Note n WHERE n.ownerUsername = :username")
    Long getTotalCharactersByOwnerUsername(@Param("username") String username);

    @Query("SELECT MAX(n.updatedAt) FROM Note n WHERE n.ownerUsername = :username")
    LocalDateTime getLastActivityByOwnerUsername(@Param("username") String username);

    // Performance queries for analytics
    @Query("SELECT DATE(n.createdAt) as date, COUNT(n) as count FROM Note n "
            + "WHERE n.ownerUsername = :username AND n.createdAt >= :fromDate "
            + "GROUP BY DATE(n.createdAt) ORDER BY date DESC")
    List<Object[]> getNoteCreationTrendByOwnerUsername(@Param("username") String username,
            @Param("fromDate") LocalDateTime fromDate);

    // Find recently updated notes
    @Query("SELECT n FROM Note n WHERE n.ownerUsername = :username "
            + "ORDER BY n.updatedAt DESC")
    List<Note> findRecentlyUpdatedByOwnerUsername(@Param("username") String username,
            Pageable pageable);

    // Find notes by date range
    @Query("SELECT n FROM Note n WHERE n.ownerUsername = :username AND "
            + "n.createdAt BETWEEN :startDate AND :endDate "
            + "ORDER BY n.createdAt DESC")
    Page<Note> findByOwnerUsernameAndDateRange(@Param("username") String username,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    // Check if user has any notes
    boolean existsByOwnerUsername(String ownerUsername);

    // Favorites queries
    Page<Note> findByOwnerUsernameAndIsFavoriteTrue(String ownerUsername, Pageable pageable);
}
