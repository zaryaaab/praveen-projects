package com.clubbing.clubbing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubDto {
    
    private Long id;
    private String name;
    private String description;
    private String category;
    private LocalDate establishmentDate;
    private String logoUrl;
    private boolean isActive;
    private int memberCount;
    private List<String> adminNames;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 