package com.clubbing.clubbing.dto;

import com.clubbing.clubbing.model.MemberRole;
import com.clubbing.clubbing.model.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipDto {
    
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long clubId;
    private String clubName;
    private MembershipStatus status;
    private MemberRole role;
    private LocalDateTime joinedAt;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedByName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isPending() {
        return status == MembershipStatus.PENDING;
    }
    
    public boolean isApproved() {
        return status == MembershipStatus.APPROVED;
    }
    
    public boolean isRejected() {
        return status == MembershipStatus.REJECTED;
    }
    
    public boolean isActive() {
        return status == MembershipStatus.APPROVED;
    }
    
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }
    
    public String getRoleDisplayName() {
        return role != null ? role.getDisplayName() : "Member";
    }
} 