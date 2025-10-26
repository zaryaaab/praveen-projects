package com.clubbing.clubbing.dto;

import com.clubbing.clubbing.model.RegistrationStatus;
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
public class EventRegistrationDto {
    
    private Long id;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String eventLocation;
    private Long userId;
    private String userName;
    private String userEmail;
    private RegistrationStatus status;
    private LocalDateTime registrationDate;
    private LocalDateTime cancellationDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper methods for UI display
    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }
    
    public String getStatusBadgeClass() {
        if (status == null) return "badge bg-secondary";
        return switch (status) {
            case REGISTERED -> "badge bg-success";
            case CANCELLED -> "badge bg-danger";
            case WAITLISTED -> "badge bg-warning";
            case ATTENDED -> "badge bg-info";
            case NO_SHOW -> "badge bg-dark";
        };
    }
    
    public String getFormattedRegistrationDate() {
        return registrationDate != null ? 
            registrationDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "";
    }
    
    public String getFormattedEventDate() {
        return eventDate != null ? 
            eventDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "";
    }
    
    public String getFormattedEventDateOnly() {
        return eventDate != null ? 
            eventDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) : "";
    }
    
    public String getFormattedEventTime() {
        return eventDate != null ? 
            eventDate.format(DateTimeFormatter.ofPattern("HH:mm")) : "";
    }
    
    public String getFormattedCancellationDate() {
        return cancellationDate != null ? 
            cancellationDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "";
    }
    
    public boolean isActive() {
        return status != null && status.isActive();
    }
    
    public boolean canCancel() {
        return status != null && status.canCancel() && !isPastEvent();
    }
    
    public boolean canAttend() {
        return status != null && status.canAttend();
    }
    
    public boolean isPastEvent() {
        return eventDate != null && LocalDateTime.now().isAfter(eventDate);
    }
    
    public boolean isUpcoming() {
        return eventDate != null && LocalDateTime.now().isBefore(eventDate);
    }
    
    public String getEventStatusText() {
        if (isPastEvent()) {
            return "Past Event";
        } else if (isUpcoming()) {
            return "Upcoming";
        } else {
            return "Today";
        }
    }
    
    public String getEventStatusBadgeClass() {
        if (isPastEvent()) {
            return "badge bg-secondary";
        } else if (isUpcoming()) {
            return "badge bg-primary";
        } else {
            return "badge bg-warning";
        }
    }
} 