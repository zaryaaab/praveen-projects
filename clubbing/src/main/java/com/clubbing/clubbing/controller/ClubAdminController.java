package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.ClubDto;
import com.clubbing.clubbing.dto.ClubUpdateDto;
import com.clubbing.clubbing.dto.MembershipDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.service.ClubService;
import com.clubbing.clubbing.service.MembershipService;
import com.clubbing.clubbing.service.UserService;
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
 * Club Admin Management Controller
 * Handles club management operations for club admins
 */
@Controller
@RequestMapping("/club-admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('CLUB_ADMIN')")
public class ClubAdminController {
    
    private final ClubService clubService;
    private final UserService userService;
    private final MembershipService membershipService;
    
    /**
     * Club Admin Dashboard - Show clubs managed by current admin
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        log.info("Displaying club admin dashboard for: {}", authentication.getName());
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        List<ClubDto> managedClubs = clubService.getClubsByAdmin(user);
        
        model.addAttribute("user", user);
        model.addAttribute("managedClubs", managedClubs);
        model.addAttribute("totalManagedClubs", managedClubs.size());
        
        // Calculate some basic stats
        long activeClubs = managedClubs.stream().mapToLong(club -> club.isActive() ? 1 : 0).sum();
        long totalMembers = managedClubs.stream().mapToLong(ClubDto::getMemberCount).sum();
        
        model.addAttribute("activeClubs", activeClubs);
        model.addAttribute("inactiveClubs", managedClubs.size() - activeClubs);
        model.addAttribute("totalMembers", totalMembers);
        
        // Get pending membership requests for all managed clubs
        List<MembershipDto> pendingRequests = membershipService.getPendingRequestsForAdmin(user);
        model.addAttribute("pendingRequests", pendingRequests);
        model.addAttribute("totalPendingRequests", pendingRequests.size());
        
        return "club-admin/dashboard";
    }
    
    /**
     * View club details (Club Admin view with management options)
     */
    @GetMapping("/clubs/view/{id}")
    public String viewClub(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Club admin viewing club details for ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        
        // Check if user can manage this club
        if (!clubService.canUserManageClub(user, id)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You don't have permission to manage this club!");
            return "redirect:/club-admin/dashboard";
        }
        
        Optional<ClubDto> clubOpt = clubService.getClubById(id);
        if (clubOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
            return "redirect:/club-admin/dashboard";
        }
        
        ClubDto club = clubOpt.get();
        
        // Get membership statistics
        MembershipService.MembershipStats membershipStats = membershipService.getMembershipStats(id);
        
        model.addAttribute("club", club);
        model.addAttribute("currentUser", user);
        model.addAttribute("canManageClub", true);
        model.addAttribute("membershipStats", membershipStats);
        
        return "club-admin/view";
    }
    
    /**
     * Show edit club form (Club Admin)
     */
    @GetMapping("/clubs/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Club admin editing club with ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        
        // Check if user can manage this club
        if (!clubService.canUserManageClub(user, id)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You don't have permission to manage this club!");
            return "redirect:/club-admin/dashboard";
        }
        
        Optional<ClubDto> clubOpt = clubService.getClubById(id);
        if (clubOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
            return "redirect:/club-admin/dashboard";
        }
        
        ClubDto club = clubOpt.get();
        
        // Convert to update DTO (Club admins can only edit certain fields)
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
        model.addAttribute("currentUser", user);
        
        return "club-admin/edit";
    }
    
    /**
     * Process club update (Club Admin - limited fields)
     */
    @PostMapping("/clubs/edit/{id}")
    public String updateClub(@PathVariable Long id,
                           @Valid @ModelAttribute ClubUpdateDto clubUpdateDto,
                           BindingResult bindingResult,
                           Model model,
                           RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        
        // Check if user can manage this club
        if (!clubService.canUserManageClub(user, id)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You don't have permission to manage this club!");
            return "redirect:/club-admin/dashboard";
        }
        
        clubUpdateDto.setId(id);
        
        if (bindingResult.hasErrors()) {
            log.warn("Club update form has validation errors");
            
            Optional<ClubDto> clubOpt = clubService.getClubById(id);
            if (clubOpt.isPresent()) {
                model.addAttribute("club", clubOpt.get());
            }
            model.addAttribute("currentUser", user);
            
            return "club-admin/edit";
        }
        
        try {
            // Club admins can only update certain fields, preserve admin assignments
            Optional<ClubDto> existingClub = clubService.getClubById(id);
            if (existingClub.isPresent()) {
                // Don't allow club admins to change admin assignments or status
                clubUpdateDto.setAdminIds(null); // Preserve existing admins
                // Note: Club admins cannot change active status - only system admin can
                clubUpdateDto.setActive(existingClub.get().isActive());
            }
            
            ClubDto updatedClub = clubService.updateClub(clubUpdateDto);
            log.info("Club updated successfully by club admin: {}", updatedClub.getName());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Club '" + updatedClub.getName() + "' updated successfully!");
            
            return "redirect:/club-admin/clubs/view/" + id;
            
        } catch (IllegalArgumentException e) {
            log.error("Error updating club: {}", e.getMessage());
            
            model.addAttribute("errorMessage", e.getMessage());
            
            Optional<ClubDto> clubOpt = clubService.getClubById(id);
            if (clubOpt.isPresent()) {
                model.addAttribute("club", clubOpt.get());
            }
            model.addAttribute("currentUser", user);
            
            return "club-admin/edit";
        }
    }
    
    /**
     * Club Members Management - Now fully implemented
     */
    @GetMapping("/clubs/{id}/members")
    public String manageMembers(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Club admin accessing member management for club ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        
        // Check if user can manage this club
        if (!clubService.canUserManageClub(user, id)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You don't have permission to manage this club!");
            return "redirect:/club-admin/dashboard";
        }
        
        // Redirect to the membership controller for full member management
        return "redirect:/membership/club/" + id + "/members";
    }
    
    /**
     * View pending membership requests for a club
     */
    @GetMapping("/clubs/{id}/requests")
    public String viewMembershipRequests(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Club admin viewing membership requests for club ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        User user = currentUser.get();
        
        // Check if user can manage this club
        if (!clubService.canUserManageClub(user, id)) {
            redirectAttributes.addFlashAttribute("errorMessage", "You don't have permission to manage this club!");
            return "redirect:/club-admin/dashboard";
        }
        
        // Redirect to the membership controller for request management
        return "redirect:/membership/club/" + id + "/requests";
    }
} 