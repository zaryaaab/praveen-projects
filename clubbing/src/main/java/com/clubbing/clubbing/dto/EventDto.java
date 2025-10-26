package com.clubbing.clubbing.dto;

import com.clubbing.clubbing.model.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDto {
    
    private Long id;
    private String title;
    private String description;
    private Long clubId;
    private String clubName;
    private LocalDateTime eventDate;
    private String location;
    private Integer capacity;
    private EventStatus status;
    private Long createdById;
    private String createdByName;
    private String imageUrl;
    private LocalDateTime registrationDeadline;
    private Integer registrationCount;
    private Integer attendanceCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper methods for UI display
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }
    
    public String getStatusBadgeClass() {
        if (status == null) return "badge bg-secondary";
        return switch (status) {
            case DRAFT -> "badge bg-warning";
            case PUBLISHED -> "badge bg-success";
            case CANCELLED -> "badge bg-danger";
            case COMPLETED -> "badge bg-info";
        };
    }
    
    public String getFormattedEventDate() {
        return eventDate != null ? eventDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "";
    }
    
    public String getFormattedEventTime() {
        return eventDate != null ? eventDate.format(DateTimeFormatter.ofPattern("HH:mm")) : "";
    }
    
    public String getFormattedEventDateOnly() {
        return eventDate != null ? eventDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "";
    }
    
    public String getFormattedRegistrationDeadline() {
        return registrationDeadline != null ? 
            registrationDeadline.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "No deadline";
    }
    
    public boolean hasCapacityLimit() {
        return capacity != null && capacity > 0;
    }
    
    public boolean isFull() {
        return hasCapacityLimit() && registrationCount != null && registrationCount >= capacity;
    }
    
    public int getAvailableSpots() {
        if (!hasCapacityLimit()) {
            return Integer.MAX_VALUE;
        }
        return Math.max(0, capacity - (registrationCount != null ? registrationCount : 0));
    }
    
    public String getCapacityText() {
        if (!hasCapacityLimit()) {
            return "Unlimited";
        }
        return String.format("%d / %d", registrationCount != null ? registrationCount : 0, capacity);
    }
    
    public boolean isPastEvent() {
        return eventDate != null && LocalDateTime.now().isAfter(eventDate);
    }
    
    public boolean isUpcoming() {
        return eventDate != null && LocalDateTime.now().isBefore(eventDate) && 
               status == EventStatus.PUBLISHED;
    }
    
    public boolean canRegister() {
        if (status != EventStatus.PUBLISHED) {
            return false;
        }
        
        if (isPastEvent()) {
            return false;
        }
        
        if (registrationDeadline != null && LocalDateTime.now().isAfter(registrationDeadline)) {
            return false;
        }
        
        if (isFull()) {
            return false;
        }
        
        return true;
    }
    
    public boolean canEdit() {
        return (status == EventStatus.DRAFT || status == EventStatus.PUBLISHED) && !isPastEvent();
    }
    
    public boolean canDelete() {
        return status == EventStatus.DRAFT || 
               (status == EventStatus.PUBLISHED && (registrationCount == null || registrationCount == 0));
    }
    
    public String getRegistrationStatusText() {
        if (!canRegister()) {
            if (isPastEvent()) {
                return "Event has ended";
            } else if (isFull()) {
                return "Event is full";
            } else if (registrationDeadline != null && LocalDateTime.now().isAfter(registrationDeadline)) {
                return "Registration closed";
            } else if (status != EventStatus.PUBLISHED) {
                return "Registration not open";
            }
        }
        return "Registration open";
    }
    
    public double getAttendanceRate() {
        if (registrationCount == null || registrationCount == 0) {
            return 0.0;
        }
        return ((double) (attendanceCount != null ? attendanceCount : 0) / registrationCount) * 100;
    }
    
    public String getFormattedAttendanceRate() {
        return String.format("%.1f%%", getAttendanceRate());
    }
} 