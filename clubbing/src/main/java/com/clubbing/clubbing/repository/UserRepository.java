package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by email for authentication
    Optional<User> findByEmail(String email);
    
    // Find user by student ID
    Optional<User> findByStudentId(String studentId);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if student ID exists
    boolean existsByStudentId(String studentId);
    
    // Find users by role
    List<User> findByRole(UserRole role);
    
    // Find active users
    List<User> findByIsActiveTrue();
    
    // Find users by role and active status
    List<User> findByRoleAndIsActiveTrue(UserRole role);
    
    // Search users by name or email (for admin functionality)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);
    
    // Count users by role
    long countByRole(UserRole role);
    
    // Count active users
    long countByIsActiveTrue();
} 