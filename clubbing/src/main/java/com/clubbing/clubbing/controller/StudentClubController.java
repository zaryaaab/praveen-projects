package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.ClubDto;
import com.clubbing.clubbing.dto.MembershipDto;
import com.clubbing.clubbing.dto.MembershipRequestDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.service.ClubService;
import com.clubbing.clubbing.service.MembershipService;
import com.clubbing.clubbing.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * Student and Club Admin Club Browsing Controller
 * Handles club browsing and viewing for students and club admins
 */
@Controller
@RequestMapping("/clubs")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('STUDENT') or hasRole('CLUB_ADMIN')")
public class StudentClubController {
    
    private final ClubService clubService;
    private final UserService userService;
    private final MembershipService membershipService;
    
    /**
     * Browse all active clubs (Student and Club Admin view)
     */
    @GetMapping
    public String browseClubs(Model model, 
                             @RequestParam(required = false) String search,
                             @RequestParam(required = false) String category,
                             Authentication authentication) {
        log.info("Displaying clubs browse page for user: {}", authentication.getName());
        
        List<ClubDto> clubs;
        
        // Apply filters
        if (category != null && !category.trim().isEmpty()) {
            clubs = clubService.getClubsByCategory(category);
            model.addAttribute("selectedCategory", category);
        } else if (search != null && !search.trim().isEmpty()) {
            clubs = clubService.searchClubs(search);
            model.addAttribute("searchTerm", search);
        } else {
            clubs = clubService.getActiveClubs();
        }
        
        model.addAttribute("clubs", clubs);
        model.addAttribute("categories", clubService.getAllCategories());
        model.addAttribute("totalClubs", clubs.size());
        
        // Get current user for role-specific features
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            model.addAttribute("currentUser", currentUser.get());
            
            // If club admin, also get their managed clubs
            if (currentUser.get().isClubAdmin()) {
                List<ClubDto> managedClubs = clubService.getClubsByAdmin(currentUser.get());
                model.addAttribute("managedClubs", managedClubs);
            }
            
            // If student, get their club memberships for display
            if (currentUser.get().isStudent()) {
                List<MembershipDto> userMemberships = membershipService.getUserMemberships(currentUser.get());
                model.addAttribute("userMemberships", userMemberships);
            }
        }
        
        return "student-clubs/browse";
    }
    
    /**
     * View club details (Student and Club Admin view)
     */
    @GetMapping("/view/{id}")
    public String viewClub(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("Displaying club details for ID: {} (student/club admin view)", id);
        
        Optional<ClubDto> clubOpt = clubService.getClubById(id);
        if (clubOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
            return "redirect:/clubs";
        }
        
        ClubDto club = clubOpt.get();
        
        // Only show active clubs to students, club admins can see their own clubs regardless of status
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            User user = currentUser.get();
            
            // Students can only view active clubs
            if (user.isStudent() && !club.isActive()) {
                redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
                return "redirect:/clubs";
            }
            
            // Club admins can view their own clubs regardless of status
            if (user.isClubAdmin() && !club.isActive()) {
                boolean canManage = clubService.canUserManageClub(user, id);
                if (!canManage) {
                    redirectAttributes.addFlashAttribute("errorMessage", "Club not found!");
                    return "redirect:/clubs";
                }
                model.addAttribute("canManageClub", true);
            }
            
            model.addAttribute("currentUser", user);
            
            // Get user's membership status for this club
            Optional<MembershipDto> userMembership = membershipService.getUserMembershipForClub(id, user);
            model.addAttribute("userMembership", userMembership.orElse(null));
            
            // Check if user can join this club
            boolean canJoin = membershipService.canUserJoinClub(id, user);
            model.addAttribute("canJoinClub", canJoin);
            
            // Add membership request DTO for the form
            model.addAttribute("membershipRequestDto", new MembershipRequestDto());
        }
        
        model.addAttribute("club", club);
        return "student-clubs/view";
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
        
        return clubService.getActiveClubs();
    }
} 