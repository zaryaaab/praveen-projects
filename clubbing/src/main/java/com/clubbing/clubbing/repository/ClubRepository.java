package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {
    
    // Find clubs by name (case-insensitive)
    List<Club> findByNameContainingIgnoreCase(String name);
    
    // Find clubs by category
    List<Club> findByCategory(String category);
    
    // Find active clubs only
    List<Club> findByIsActiveTrue();
    
    // Find clubs by admin
    @Query("SELECT c FROM Club c JOIN c.admins a WHERE a = :admin")
    List<Club> findByAdmin(@Param("admin") User admin);
    
    // Find clubs managed by a specific user
    @Query("SELECT c FROM Club c JOIN c.admins a WHERE a.id = :adminId")
    List<Club> findByAdminId(@Param("adminId") Long adminId);
    
    // Check if club name exists (for validation)
    boolean existsByNameIgnoreCase(String name);
    
    // Find club by name (case-insensitive)
    Optional<Club> findByNameIgnoreCase(String name);
    
    // Count total clubs
    long countByIsActiveTrue();
    
    // Count clubs by category
    long countByCategory(String category);
    
    // Get all distinct categories
    @Query("SELECT DISTINCT c.category FROM Club c ORDER BY c.category")
    List<String> findAllCategories();
    
    // Search clubs by name or description
    @Query("SELECT c FROM Club c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "c.isActive = true")
    List<Club> searchActiveClubs(@Param("searchTerm") String searchTerm);
} 