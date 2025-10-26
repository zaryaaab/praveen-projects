package com.clubbing.clubbing.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 200, message = "Event title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;
    
    @NotBlank(message = "Event description is required")
    @Size(min = 10, max = 2000, message = "Event description must be between 10 and 2000 characters")
    @Column(nullable = false, length = 2000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    @NotNull(message = "Club is required")
    private Club club;
    
    @NotNull(message = "Event date and time is required")
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;
    
    @NotBlank(message = "Event location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    @Column(nullable = false, length = 255)
    private String location;
    
    @Min(value = 0, message = "Capacity must be non-negative")
    @Column(name = "capacity")
    @Builder.Default
    private Integer capacity = 0; // 0 means unlimited
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @NotNull(message = "Event creator is required")
    private User createdBy;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;
    
    @Column(name = "registration_count")
    @Builder.Default
    private Integer registrationCount = 0;
    
    @Column(name = "attendance_count")
    @Builder.Default
    private Integer attendanceCount = 0;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventRegistration> registrations = new ArrayList<>();
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EventAttendance> attendances = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean canRegister() {
        if (!status.canRegister()) {
            return false;
        }
        
        // Check if registration deadline has passed
        if (registrationDeadline != null && LocalDateTime.now().isAfter(registrationDeadline)) {
            return false;
        }
        
        // Check if event has already occurred
        if (LocalDateTime.now().isAfter(eventDate)) {
            return false;
        }
        
        // Check capacity
        if (capacity > 0 && registrationCount >= capacity) {
            return false;
        }
        
        return true;
    }
    
    public boolean hasCapacityLimit() {
        return capacity != null && capacity > 0;
    }
    
    public boolean isFull() {
        return hasCapacityLimit() && registrationCount >= capacity;
    }
    
    public int getAvailableSpots() {
        if (!hasCapacityLimit()) {
            return Integer.MAX_VALUE;
        }
        return Math.max(0, capacity - registrationCount);
    }
    
    public boolean isPastEvent() {
        return LocalDateTime.now().isAfter(eventDate);
    }
    
    public boolean isUpcoming() {
        return LocalDateTime.now().isBefore(eventDate) && status.isActive();
    }
    
    public boolean canEdit() {
        return status.canEdit() && !isPastEvent();
    }
    
    public boolean canDelete() {
        return status == EventStatus.DRAFT || (status == EventStatus.PUBLISHED && registrationCount == 0);
    }
    
    public void incrementRegistrationCount() {
        this.registrationCount = (this.registrationCount == null ? 0 : this.registrationCount) + 1;
    }
    
    public void decrementRegistrationCount() {
        this.registrationCount = Math.max(0, (this.registrationCount == null ? 0 : this.registrationCount) - 1);
    }
    
    public void incrementAttendanceCount() {
        this.attendanceCount = (this.attendanceCount == null ? 0 : this.attendanceCount) + 1;
    }
    
    public void decrementAttendanceCount() {
        this.attendanceCount = Math.max(0, (this.attendanceCount == null ? 0 : this.attendanceCount) - 1);
    }
} 