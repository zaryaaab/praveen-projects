package com.clubbing.clubbing.dto;

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
public class EventCreationDto {
    
    @NotBlank(message = "Event title is required")
    @Size(min = 3, max = 200, message = "Event title must be between 3 and 200 characters")
    private String title;
    
    @NotBlank(message = "Event description is required")
    @Size(min = 10, max = 2000, message = "Event description must be between 10 and 2000 characters")
    private String description;
    
    @NotNull(message = "Club selection is required")
    private Long clubId;
    
    @NotNull(message = "Event date and time is required")
    @Future(message = "Event date must be in the future")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime eventDate;
    
    @NotBlank(message = "Event location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
    
    @Min(value = 0, message = "Capacity must be non-negative")
    @Max(value = 10000, message = "Capacity cannot exceed 10,000")
    private Integer capacity;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime registrationDeadline;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    @Builder.Default
    private boolean publishImmediately = false;
    
    // Validation methods
    @AssertTrue(message = "Registration deadline must be before event date")
    public boolean isRegistrationDeadlineValid() {
        if (registrationDeadline == null || eventDate == null) {
            return true; // Let other validations handle null values
        }
        return registrationDeadline.isBefore(eventDate);
    }
    
    @AssertTrue(message = "Registration deadline must be in the future")
    public boolean isRegistrationDeadlineInFuture() {
        if (registrationDeadline == null) {
            return true; // Registration deadline is optional
        }
        return registrationDeadline.isAfter(LocalDateTime.now());
    }
    
    // Helper methods
    public boolean hasCapacityLimit() {
        return capacity != null && capacity > 0;
    }
    
    public boolean hasRegistrationDeadline() {
        return registrationDeadline != null;
    }
} 