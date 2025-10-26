package com.clubbing.clubbing.dto;

import com.clubbing.clubbing.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for User information
 * Used for transferring user data to frontend without exposing sensitive information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    private String name;
    private String email;
    private String studentId;
    private String department;
    private UserRole role;
    private boolean isActive;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper methods
    public String getRoleDisplayName() {
        return role != null ? role.getDisplayName() : "Unknown";
    }
    
    public String getStatusText() {
        return isActive ? "Active" : "Inactive";
    }
    
    public String getStatusBadgeClass() {
        return isActive ? "badge bg-success" : "badge bg-danger";
    }
    
    public String getRoleBadgeClass() {
        if (role == null) return "badge bg-secondary";
        
        return switch (role) {
            case SYSTEM_ADMIN -> "badge bg-danger";
            case CLUB_ADMIN -> "badge bg-warning";
            case STUDENT -> "badge bg-primary";
        };
    }
} 