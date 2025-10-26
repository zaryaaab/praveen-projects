package com.clubbing.clubbing.dto;

import com.clubbing.clubbing.model.EventStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventUpdateDto {
    
    @NotNull(message = "Event ID is required")
    private Long id;
    
    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 200, message = "Event title must be between 3 and 200 characters")
    private String title;
    
    @NotBlank(message = "Event description is required")
    @Size(min = 10, max = 2000, message = "Event description must be between 10 and 2000 characters")
    private String description;
    
    @NotNull(message = "Event date and time is required")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime eventDate;
    
    @NotBlank(message = "Event location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
    
    @Min(value = 0, message = "Capacity must be non-negative")
    @Max(value = 10000, message = "Capacity cannot exceed 10,000")
    private Integer capacity;
    
    @NotNull(message = "Event status is required")
    private EventStatus status;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime registrationDeadline;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    // Current registration count (for validation)
    private Integer currentRegistrationCount;
    
    // Validation methods
    @AssertTrue(message = "Registration deadline must be before event date")
    public boolean isRegistrationDeadlineValid() {
        if (registrationDeadline == null || eventDate == null) {
            return true; // Let other validations handle null values
        }
        return registrationDeadline.isBefore(eventDate);
    }
    
    @AssertTrue(message = "Cannot reduce capacity below current registration count")
    public boolean isCapacityValid() {
        if (capacity == null || capacity == 0 || currentRegistrationCount == null) {
            return true; // Unlimited capacity or no registrations
        }
        return capacity >= currentRegistrationCount;
    }
    
    @AssertTrue(message = "Cannot set past date for future events")
    public boolean isEventDateValid() {
        if (eventDate == null) {
            return true; // Let other validations handle null values
        }
        // Allow past dates only if event is already completed
        if (status == EventStatus.COMPLETED) {
            return true;
        }
        return eventDate.isAfter(LocalDateTime.now());
    }
    
    // Helper methods
    public boolean hasCapacityLimit() {
        return capacity != null && capacity > 0;
    }
    
    public boolean hasRegistrationDeadline() {
        return registrationDeadline != null;
    }
    
    public boolean isCapacityReduced() {
        return currentRegistrationCount != null && capacity != null && 
               capacity > 0 && capacity < currentRegistrationCount;
    }
} 