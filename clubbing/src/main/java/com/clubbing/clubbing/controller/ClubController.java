package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.ClubCreationDto;
import com.clubbing.clubbing.dto.ClubDto;
import com.clubbing.clubbing.dto.ClubUpdateDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import com.clubbing.clubbing.repository.UserRepository;
import com.clubbing.clubbing.service.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * System Admin Club Management Controller
 * Handles CRUD operations for clubs (System Admin only)
 */
@Controller
@RequestMapping("/admin/clubs")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class ClubController {
    
    private final ClubService clubService;
    private final UserRepository userRepository;
    
    /**
     * Display all clubs (System Admin view)
     */
    @GetMapping
    public String listClubs(Model model, Authentication authentication) {
        log.info("Displaying clubs list for admin");
        
        List<ClubDto> clubs = clubService.getAllClubs();
        ClubService.ClubStats stats = clubService.getClubStats();
        
        model.addAttribute("clubs", clubs);
        model.addAttribute("stats", stats);
        model.addAttribute("categories", clubService.getAllCategories());
        
        return "clubs/list";
    }
    
    /**
     * Show create club form
     */
    @GetMapping("/create")
    public String showCreateForm(Model model) {
        log.info("Displaying create club form");
        
        model.addAttribute("clubCreationDto", new ClubCreationDto());
        
        // Get all club admins for assignment
        List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
        model.addAttribute("availableAdmins", clubAdmins);
        
        return "clubs/create";
    }
    
    /**
     * Process club creation
     */
    @PostMapping("/create")
    public String createClub(@Valid @ModelAttribute ClubCreationDto clubCreationDto,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {
        
        if (bindingResult.hasErrors()) {
            log.warn("Club creation form has validation errors");
            List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
            model.addAttribute("availableAdmins", clubAdmins);
            return "clubs/create";
        }
        
        try {
            ClubDto createdClub = clubService.createClub(clubCreationDto);
            log.info("Club created successfully: {}", createdClub.getName());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Club '" + createdClub.getName() + "' created successfully!");
            
            return "redirect:/admin/clubs";
            
        } catch (IllegalArgumentException e) {
            log.error("Error creating club: {}", e.getMessage());
            
            model.addAttribute("errorMessage", e.getMessage());
            List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
            model.addAttribute("availableAdmins", clubAdmins);
            
            return "clubs/create";
        }
    }
    
    /**
     * Show edit club form
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Displaying edit form for club ID: {}", id);
        
        Optional<ClubDto> clubOpt = clubService.getClubById(id);
        if (clubOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
            return "redirect:/admin/clubs";
        }
        
        ClubDto club = clubOpt.get();
        
        // Convert to update DTO
        ClubUpdateDto clubUpdateDto = ClubUpdateDto.builder()
                .id(club.getId())
                .name(club.getName())
                .description(club.getDescription())
                .category(club.getCategory())
                .establishmentDate(club.getEstablishmentDate())
                .logoUrl(club.getLogoUrl())
                .isActive(club.isActive())
                .build();
        
        model.addAttribute("clubUpdateDto", clubUpdateDto);
        model.addAttribute("club", club);
        
        // Get all club admins for assignment
        List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
        model.addAttribute("availableAdmins", clubAdmins);
        
        return "clubs/edit";
    }
    
    /**
     * Process club update
     */
    @PostMapping("/edit/{id}")
    public String updateClub(@PathVariable Long id,
                           @Valid @ModelAttribute ClubUpdateDto clubUpdateDto,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {
        
        clubUpdateDto.setId(id);
        
        if (bindingResult.hasErrors()) {
            log.warn("Club update form has validation errors");
            
            Optional<ClubDto> clubOpt = clubService.getClubById(id);
            if (clubOpt.isPresent()) {
                model.addAttribute("club", clubOpt.get());
            }
            
            List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
            model.addAttribute("availableAdmins", clubAdmins);
            
            return "clubs/edit";
        }
        
        try {
            ClubDto updatedClub = clubService.updateClub(clubUpdateDto);
            log.info("Club updated successfully: {}", updatedClub.getName());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Club '" + updatedClub.getName() + "' updated successfully!");
            
            return "redirect:/admin/clubs";
            
        } catch (IllegalArgumentException e) {
            log.error("Error updating club: {}", e.getMessage());
            
            model.addAttribute("errorMessage", e.getMessage());
            
            Optional<ClubDto> clubOpt = clubService.getClubById(id);
            if (clubOpt.isPresent()) {
                model.addAttribute("club", clubOpt.get());
            }
            
            List<User> clubAdmins = userRepository.findByRole(UserRole.CLUB_ADMIN);
            model.addAttribute("availableAdmins", clubAdmins);
            
            return "clubs/edit";
        }
    }
    
    /**
     * View club details
     */
    @GetMapping("/view/{id}")
    public String viewClub(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Displaying club details for ID: {}", id);
        
        Optional<ClubDto> clubOpt = clubService.getClubById(id);
        if (clubOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
            return "redirect:/admin/clubs";
        }
        
        model.addAttribute("club", clubOpt.get());
        return "clubs/view";
    }
    
    /**
     * Toggle club status (activate/deactivate)
     */
    @PostMapping("/toggle-status/{id}")
    public String toggleClubStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        log.info("Toggling status for club ID: {}", id);
        
        try {
            ClubDto updatedClub = clubService.toggleClubStatus(id);
            String status = updatedClub.isActive() ? "activated" : "deactivated";
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Club '" + updatedClub.getName() + "' " + status + " successfully!");
            
        } catch (IllegalArgumentException e) {
            log.error("Error toggling club status: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/admin/clubs";
    }
    
    /**
     * Delete club
     */
    @PostMapping("/delete/{id}")
    public String deleteClub(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        log.info("Deleting club with ID: {}", id);
        
        try {
            // Get club name before deletion for message
            Optional<ClubDto> clubOpt = clubService.getClubById(id);
            String clubName = clubOpt.map(ClubDto::getName).orElse("Unknown");
            
            clubService.deleteClub(id);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Club '" + clubName + "' deleted successfully!");
            
        } catch (IllegalArgumentException e) {
            log.error("Error deleting club: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/admin/clubs";
    }
    
    /**
     * Search clubs (AJAX endpoint)
     */
    @GetMapping("/search")
    @ResponseBody
    public List<ClubDto> searchClubs(@RequestParam(required = false) String term,
                                   @RequestParam(required = false) String category) {
        
        if (category != null && !category.trim().isEmpty()) {
            return clubService.getClubsByCategory(category);
        }
        
        if (term != null && !term.trim().isEmpty()) {
            return clubService.searchClubs(term);
        }
        
        return clubService.getAllClubs();
    }
} 