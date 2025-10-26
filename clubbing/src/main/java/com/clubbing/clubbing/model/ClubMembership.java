package com.clubbing.clubbing.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "club_memberships", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "club_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMembership {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    @Column(name = "requested_at")
    @CreationTimestamp
    private LocalDateTime requestedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
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
    
    public void approve(User approvedBy) {
        this.status = MembershipStatus.APPROVED;
        this.joinedAt = LocalDateTime.now();
        this.processedAt = LocalDateTime.now();
        this.processedBy = approvedBy;
    }
    
    public void reject(User rejectedBy, String reason) {
        this.status = MembershipStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
        this.processedBy = rejectedBy;
        this.notes = reason;
    }
    
    public void leave() {
        this.status = MembershipStatus.LEFT;
        this.processedAt = LocalDateTime.now();
    }
} 