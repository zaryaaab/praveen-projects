package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.UserDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import com.clubbing.clubbing.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * User Management Controller (System Admin only)
 * Handles user administration operations
 */
@Controller
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class UserController {
    
    private final UserService userService;
    
    /**
     * List all users (System Admin)
     */
    @GetMapping
    public String listUsers(Model model) {
        log.info("System admin accessing user management");
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        List<UserDto> users = userService.getAllUsers();
        
        // Calculate statistics
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(UserDto::isActive).count();
        long inactiveUsers = totalUsers - activeUsers;
        long systemAdmins = users.stream().filter(u -> u.getRole() == UserRole.SYSTEM_ADMIN).count();
        long clubAdmins = users.stream().filter(u -> u.getRole() == UserRole.CLUB_ADMIN).count();
        long students = users.stream().filter(u -> u.getRole() == UserRole.STUDENT).count();
        
        model.addAttribute("users", users);
        model.addAttribute("currentUser", currentUser.get());
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("activeUsers", activeUsers);
        model.addAttribute("inactiveUsers", inactiveUsers);
        model.addAttribute("systemAdmins", systemAdmins);
        model.addAttribute("clubAdmins", clubAdmins);
        model.addAttribute("students", students);
        model.addAttribute("userRoles", UserRole.values());
        
        return "admin/users";
    }
    
    /**
     * View user details (System Admin)
     */
    @GetMapping("/view/{id}")
    public String viewUser(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        log.info("System admin viewing user details for ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        Optional<UserDto> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("errorMessage", "User not found!");
            return "redirect:/admin/users";
        }
        
        UserDto user = userOpt.get();
        
        model.addAttribute("user", user);
        model.addAttribute("currentUser", currentUser.get());
        
        return "admin/user-view";
    }
    
    /**
     * Toggle user active status (System Admin)
     */
    @PostMapping("/toggle-status/{id}")
    public String toggleUserStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        log.info("System admin toggling status for user ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            UserDto updatedUser = userService.toggleUserStatus(id);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "User '" + updatedUser.getName() + "' status updated to " + 
                (updatedUser.isActive() ? "Active" : "Inactive"));
            
        } catch (IllegalArgumentException e) {
            log.error("Error toggling user status: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/admin/users";
    }
    
    /**
     * Update user role (System Admin)
     */
    @PostMapping("/update-role/{id}")
    public String updateUserRole(@PathVariable Long id, 
                                @RequestParam UserRole role,
                                RedirectAttributes redirectAttributes) {
        log.info("System admin updating role for user ID: {} to {}", id, role);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            UserDto updatedUser = userService.updateUserRole(id, role);
            
            redirectAttributes.addFlashAttribute("successMessage", 
                "User '" + updatedUser.getName() + "' role updated to " + role.getDisplayName());
            
        } catch (IllegalArgumentException e) {
            log.error("Error updating user role: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/admin/users";
    }
    
    /**
     * Delete user (System Admin)
     */
    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        log.info("System admin deleting user ID: {}", id);
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }
        
        try {
            // Prevent self-deletion
            if (currentUser.get().getId().equals(id)) {
                redirectAttributes.addFlashAttribute("errorMessage", "You cannot delete your own account!");
                return "redirect:/admin/users";
            }
            
            userService.deleteUser(id);
            
            redirectAttributes.addFlashAttribute("successMessage", "User deleted successfully!");
            
        } catch (IllegalArgumentException e) {
            log.error("Error deleting user: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        
        return "redirect:/admin/users";
    }
} 