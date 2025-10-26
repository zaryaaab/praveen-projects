package com.clubbing.clubbing.service;

import com.clubbing.clubbing.dto.ClubCreationDto;
import com.clubbing.clubbing.dto.ClubDto;
import com.clubbing.clubbing.dto.ClubUpdateDto;
import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import com.clubbing.clubbing.repository.ClubRepository;
import com.clubbing.clubbing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClubService {
    
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new club (System Admin only)
     */
    public ClubDto createClub(ClubCreationDto clubCreationDto) {
        log.info("Creating new club: {}", clubCreationDto.getName());
        
        // Check if club name already exists
        if (clubRepository.existsByNameIgnoreCase(clubCreationDto.getName())) {
            throw new IllegalArgumentException("Club with name '" + clubCreationDto.getName() + "' already exists");
        }
        
        // Create club entity
        Club club = Club.builder()
                .name(clubCreationDto.getName())
                .description(clubCreationDto.getDescription())
                .category(clubCreationDto.getCategory())
                .establishmentDate(clubCreationDto.getEstablishmentDate())
                .logoUrl(clubCreationDto.getLogoUrl())
                .isActive(true)
                .memberCount(0)
                .build();
        
        // Add admins if provided
        if (clubCreationDto.getAdminIds() != null && !clubCreationDto.getAdminIds().isEmpty()) {
            for (Long adminId : clubCreationDto.getAdminIds()) {
                User admin = userRepository.findById(adminId)
                        .orElseThrow(() -> new IllegalArgumentException("User with ID " + adminId + " not found"));
                
                // Ensure the user is a club admin
                if (admin.getRole() != UserRole.CLUB_ADMIN && admin.getRole() != UserRole.SYSTEM_ADMIN) {
                    throw new IllegalArgumentException("User " + admin.getName() + " is not a club admin");
                }
                
                club.addAdmin(admin);
            }
        }
        
        Club savedClub = clubRepository.save(club);
        log.info("Club created successfully with ID: {}", savedClub.getId());
        
        return convertToDto(savedClub);
    }
    
    /**
     * Update an existing club
     */
    public ClubDto updateClub(ClubUpdateDto clubUpdateDto) {
        log.info("Updating club with ID: {}", clubUpdateDto.getId());
        
        Club club = clubRepository.findById(clubUpdateDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Club not found with ID: " + clubUpdateDto.getId()));
        
        // Check if name is being changed and if new name already exists
        if (!club.getName().equalsIgnoreCase(clubUpdateDto.getName()) && 
            clubRepository.existsByNameIgnoreCase(clubUpdateDto.getName())) {
            throw new IllegalArgumentException("Club with name '" + clubUpdateDto.getName() + "' already exists");
        }
        
        // Update club fields
        club.setName(clubUpdateDto.getName());
        club.setDescription(clubUpdateDto.getDescription());
        club.setCategory(clubUpdateDto.getCategory());
        club.setEstablishmentDate(clubUpdateDto.getEstablishmentDate());
        club.setLogoUrl(clubUpdateDto.getLogoUrl());
        club.setActive(clubUpdateDto.isActive());
        
        // Update admins if provided
        if (clubUpdateDto.getAdminIds() != null) {
            club.getAdmins().clear();
            for (Long adminId : clubUpdateDto.getAdminIds()) {
                User admin = userRepository.findById(adminId)
                        .orElseThrow(() -> new IllegalArgumentException("User with ID " + adminId + " not found"));
                
                if (admin.getRole() != UserRole.CLUB_ADMIN && admin.getRole() != UserRole.SYSTEM_ADMIN) {
                    throw new IllegalArgumentException("User " + admin.getName() + " is not a club admin");
                }
                
                club.addAdmin(admin);
            }
        }
        
        Club savedClub = clubRepository.save(club);
        log.info("Club updated successfully: {}", savedClub.getName());
        
        return convertToDto(savedClub);
    }
    
    /**
     * Get all clubs (System Admin view)
     */
    @Transactional(readOnly = true)
    public List<ClubDto> getAllClubs() {
        return clubRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active clubs only (Student view)
     */
    @Transactional(readOnly = true)
    public List<ClubDto> getActiveClubs() {
        return clubRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get clubs managed by a specific admin
     */
    @Transactional(readOnly = true)
    public List<ClubDto> getClubsByAdmin(User admin) {
        return clubRepository.findByAdmin(admin).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get club by ID
     */
    @Transactional(readOnly = true)
    public Optional<ClubDto> getClubById(Long id) {
        return clubRepository.findById(id)
                .map(this::convertToDto);
    }
    
    /**
     * Search clubs by name or description
     */
    @Transactional(readOnly = true)
    public List<ClubDto> searchClubs(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getActiveClubs();
        }
        
        return clubRepository.searchActiveClubs(searchTerm.trim()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get clubs by category
     */
    @Transactional(readOnly = true)
    public List<ClubDto> getClubsByCategory(String category) {
        return clubRepository.findByCategory(category).stream()
                .filter(Club::isActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all categories
     */
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return clubRepository.findAllCategories();
    }
    
    /**
     * Delete a club (System Admin only)
     */
    public void deleteClub(Long id) {
        log.info("Deleting club with ID: {}", id);
        
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Club not found with ID: " + id));
        
        clubRepository.delete(club);
        log.info("Club deleted successfully: {}", club.getName());
    }
    
    /**
     * Toggle club active status
     */
    public ClubDto toggleClubStatus(Long id) {
        log.info("Toggling status for club with ID: {}", id);
        
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Club not found with ID: " + id));
        
        club.setActive(!club.isActive());
        Club savedClub = clubRepository.save(club);
        
        log.info("Club status toggled: {} - Active: {}", savedClub.getName(), savedClub.isActive());
        return convertToDto(savedClub);
    }
    
    /**
     * Get club statistics
     */
    @Transactional(readOnly = true)
    public ClubStats getClubStats() {
        long totalClubs = clubRepository.count();
        long activeClubs = clubRepository.countByIsActiveTrue();
        List<String> categories = getAllCategories();
        
        return ClubStats.builder()
                .totalClubs(totalClubs)
                .activeClubs(activeClubs)
                .inactiveClubs(totalClubs - activeClubs)
                .totalCategories(categories.size())
                .build();
    }
    
    /**
     * Check if user can manage club
     */
    @Transactional(readOnly = true)
    public boolean canUserManageClub(User user, Long clubId) {
        if (user.isSystemAdmin()) {
            return true;
        }
        
        if (user.isClubAdmin()) {
            return clubRepository.findById(clubId)
                    .map(club -> club.hasAdmin(user))
                    .orElse(false);
        }
        
        return false;
    }
    
    /**
     * Convert Club entity to DTO
     */
    private ClubDto convertToDto(Club club) {
        List<String> adminNames = club.getAdmins().stream()
                .map(User::getName)
                .collect(Collectors.toList());
        
        return ClubDto.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .category(club.getCategory())
                .establishmentDate(club.getEstablishmentDate())
                .logoUrl(club.getLogoUrl())
                .isActive(club.isActive())
                .memberCount(club.getMemberCount())
                .adminNames(adminNames)
                .createdAt(club.getCreatedAt())
                .updatedAt(club.getUpdatedAt())
                .build();
    }
    
    /**
     * Inner class for club statistics
     */
    @lombok.Data
    @lombok.Builder
    public static class ClubStats {
        private long totalClubs;
        private long activeClubs;
        private long inactiveClubs;
        private long totalCategories;
    }
} 