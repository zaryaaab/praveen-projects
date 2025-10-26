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
@Table(name = "event_registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.REGISTERED;
    
    @Column(name = "registration_date")
    @CreationTimestamp
    private LocalDateTime registrationDate;
    
    @Column(name = "cancellation_date")
    private LocalDateTime cancellationDate;
    
    @Column(name = "notes", length = 500)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isActive() {
        return status.isActive();
    }
    
    public boolean canCancel() {
        return status.canCancel() && !event.isPastEvent();
    }
    
    public boolean canAttend() {
        return status.canAttend();
    }
    
    public void cancel(String reason) {
        this.status = RegistrationStatus.CANCELLED;
        this.cancellationDate = LocalDateTime.now();
        this.notes = reason;
    }
    
    public void markAsAttended() {
        if (status == RegistrationStatus.REGISTERED) {
            this.status = RegistrationStatus.ATTENDED;
        }
    }
    
    public void markAsNoShow() {
        if (status == RegistrationStatus.REGISTERED) {
            this.status = RegistrationStatus.NO_SHOW;
        }
    }
    
    public void moveToWaitlist() {
        if (status == RegistrationStatus.REGISTERED) {
            this.status = RegistrationStatus.WAITLISTED;
        }
    }
    
    public void activateFromWaitlist() {
        if (status == RegistrationStatus.WAITLISTED) {
            this.status = RegistrationStatus.REGISTERED;
        }
    }
} 