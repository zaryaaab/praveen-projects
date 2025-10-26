package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.MembershipDto;
import com.clubbing.clubbing.dto.MembershipRequestDto;
import com.clubbing.clubbing.model.MemberRole;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.service.MembershipService;
import com.clubbing.clubbing.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * Membership Management Controller
 * Handles club membership operations for students and club admins
 */
@Controller
@RequestMapping("/membership")
@RequiredArgsConstructor
@Slf4j
public class MembershipController {
    
    private final MembershipService membershipService;
    private final UserService userService;
    
    /**
     * Request to join a club (Student only)
     */
    @PostMapping("/join/{clubId}")
    @PreAuthorize("hasRole('STUDENT')")
    public String requestToJoinClub(@PathVariable Long clubId,
                                   @Valid @ModelAttribute MembershipRequestDto requestDto,
                                   BindingResult bindingResult,
                                   RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("errorMessage", "Please provide a valid message");
            return "redirect:/clubs/view/" + clubId;
        }
        
        try {
            requestDto.setClubId(clubId);
            MembershipDto membership = membershipService.requestToJoinClub(clubId, currentUser.get(), requestDto);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Your membership request has been submitted successfully! You will be notified once it's reviewed.");
            
            log.info("Membership request submitted for club {} by user {}", clubId, currentUser.get().getEmail());
            
        } catch (IllegalArgumentException e) {
            log.error("Error submitting membership request: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/clubs/view/" + clubId;
    }
    
    /**
     * Leave a club (Student only)
     */
    @PostMapping("/leave/{clubId}")
    @PreAuthorize("hasRole('STUDENT')")
    public String leaveClub(@PathVariable Long clubId, RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            membershipService.leaveClub(clubId, currentUser.get());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "You have successfully left the club.");
            
            log.info("User {} left club {}", currentUser.get().getEmail(), clubId);
            
        } catch (IllegalArgumentException e) {
            log.error("Error leaving club: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/clubs/view/" + clubId;
    }
    
    /**
     * View membership requests for a club (Club Admin)
     */
    @GetMapping("/club/{clubId}/requests")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String viewClubMembershipRequests(@PathVariable Long clubId, Model model, RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            List<MembershipDto> pendingRequests = membershipService.getPendingRequestsForClub(clubId, currentUser.get());
            
            model.addAttribute("clubId", clubId);
            model.addAttribute("pendingRequests", pendingRequests);
            model.addAttribute("currentUser", currentUser.get());
            
            return "membership/club-requests";
            
        } catch (IllegalArgumentException e) {
            log.error("Error viewing membership requests: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * View club members (Club Admin)
     */
    @GetMapping("/club/{clubId}/members")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String viewClubMembers(@PathVariable Long clubId, Model model, RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            List<MembershipDto> members = membershipService.getClubMembers(clubId, currentUser.get());
            List<MembershipDto> pendingRequests = membershipService.getPendingRequestsForClub(clubId, currentUser.get());
            
            model.addAttribute("clubId", clubId);
            model.addAttribute("members", members);
            model.addAttribute("pendingRequests", pendingRequests);
            model.addAttribute("currentUser", currentUser.get());
            model.addAttribute("memberRoles", MemberRole.values());
            
            return "membership/club-members";
            
        } catch (IllegalArgumentException e) {
            log.error("Error viewing club members: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * Approve membership request (Club Admin)
     */
    @PostMapping("/approve/{membershipId}")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String approveMembershipRequest(@PathVariable Long membershipId, RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            MembershipDto membership = membershipService.approveMembershipRequest(membershipId, currentUser.get());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Membership request approved successfully! " + membership.getUserName() + " is now a member.");
            
            log.info("Membership request {} approved by {}", membershipId, currentUser.get().getEmail());
            
            return "redirect:/membership/club/" + membership.getClubId() + "/members";
            
        } catch (IllegalArgumentException e) {
            log.error("Error approving membership request: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * Reject membership request (Club Admin)
     */
    @PostMapping("/reject/{membershipId}")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String rejectMembershipRequest(@PathVariable Long membershipId,
                                         @RequestParam(required = false) String reason,
                                         RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            String rejectionReason = reason != null && !reason.trim().isEmpty() ? reason : "No reason provided";
            MembershipDto membership = membershipService.rejectMembershipRequest(membershipId, currentUser.get(), rejectionReason);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Membership request rejected.");
            
            log.info("Membership request {} rejected by {}", membershipId, currentUser.get().getEmail());
            
            return "redirect:/membership/club/" + membership.getClubId() + "/members";
            
        } catch (IllegalArgumentException e) {
            log.error("Error rejecting membership request: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * Update member role (Club Admin)
     */
    @PostMapping("/update-role/{membershipId}")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String updateMemberRole(@PathVariable Long membershipId,
                                  @RequestParam MemberRole role,
                                  RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            MembershipDto membership = membershipService.updateMemberRole(membershipId, role, currentUser.get());
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Member role updated successfully! " + membership.getUserName() + " is now a " + role.getDisplayName() + ".");
            
            log.info("Member role updated for membership {} by {}", membershipId, currentUser.get().getEmail());
            
            return "redirect:/membership/club/" + membership.getClubId() + "/members";
            
        } catch (IllegalArgumentException e) {
            log.error("Error updating member role: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * Remove member from club (Club Admin)
     */
    @PostMapping("/remove/{membershipId}")
    @PreAuthorize("hasRole('CLUB_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public String removeMemberFromClub(@PathVariable Long membershipId,
                                      @RequestParam(required = false) String reason,
                                      RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            // Get membership info before removal
            Optional<MembershipDto> membershipOpt = membershipService.getUserMembershipForClub(null, currentUser.get());
            
            String removalReason = reason != null && !reason.trim().isEmpty() ? reason : "Removed by admin";
            membershipService.removeMemberFromClub(membershipId, currentUser.get(), removalReason);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "Member removed from club successfully.");
            
            log.info("Member removed from club for membership {} by {}", membershipId, currentUser.get().getEmail());
            
            return "redirect:/club-admin/dashboard";
            
        } catch (IllegalArgumentException e) {
            log.error("Error removing member from club: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/club-admin/dashboard";
        }
    }
    
    /**
     * View user's club memberships (Student)
     */
    @GetMapping("/my-clubs")
    @PreAuthorize("hasRole('STUDENT')")
    public String viewMyClubs(Model model) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        List<MembershipDto> memberships = membershipService.getUserMemberships(currentUser.get());
        
        model.addAttribute("memberships", memberships);
        model.addAttribute("currentUser", currentUser.get());
        
        return "membership/my-clubs";
    }
} 