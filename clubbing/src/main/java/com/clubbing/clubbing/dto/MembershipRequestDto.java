package com.clubbing.clubbing.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipRequestDto {
    
    private Long clubId;
    
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;
    
    private String motivation;
} 