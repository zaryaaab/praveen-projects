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
@Table(name = "event_attendance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAttendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "attended")
    @Builder.Default
    private Boolean attended = false;
    
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by")
    private User markedBy;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void markAttended(User markedBy) {
        this.attended = true;
        this.checkInTime = LocalDateTime.now();
        this.markedBy = markedBy;
    }
    
    public void markNotAttended(User markedBy, String reason) {
        this.attended = false;
        this.checkInTime = null;
        this.markedBy = markedBy;
        this.notes = reason;
    }
    
    public boolean isAttended() {
        return Boolean.TRUE.equals(attended);
    }
    
    public boolean canMarkAttendance() {
        // Can mark attendance during event day or after
        return !event.getEventDate().toLocalDate().isAfter(LocalDateTime.now().toLocalDate());
    }
} 