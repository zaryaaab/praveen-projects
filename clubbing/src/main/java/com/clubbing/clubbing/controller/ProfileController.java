package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.PasswordChangeDto;
import com.clubbing.clubbing.dto.UserProfileDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public String profilePage(Model model) {
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }

        User user = currentUser.get();
        
        // Convert User to UserProfileDto
        UserProfileDto profileDto = UserProfileDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .build();

        model.addAttribute("user", user);
        model.addAttribute("profileDto", profileDto);
        return "profile/profile";
    }

    @PostMapping("/update")
    public String updateProfile(@Valid @ModelAttribute("profileDto") UserProfileDto profileDto,
                               BindingResult result,
                               Model model,
                               RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }

        if (result.hasErrors()) {
            model.addAttribute("user", currentUser.get());
            return "profile/profile";
        }

        try {
            User updatedUser = userService.updateProfile(profileDto);
            redirectAttributes.addFlashAttribute("success", "Profile updated successfully!");
            log.info("Profile updated for user: {}", updatedUser.getEmail());
            return "redirect:/profile";
            
        } catch (RuntimeException e) {
            model.addAttribute("user", currentUser.get());
            model.addAttribute("error", e.getMessage());
            return "profile/profile";
        }
    }

    @GetMapping("/change-password")
    public String changePasswordPage(Model model) {
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }

        model.addAttribute("user", currentUser.get());
        model.addAttribute("passwordChangeDto", new PasswordChangeDto());
        return "profile/change-password";
    }

    @PostMapping("/change-password")
    public String changePassword(@Valid @ModelAttribute("passwordChangeDto") PasswordChangeDto passwordChangeDto,
                                BindingResult result,
                                Model model,
                                RedirectAttributes redirectAttributes) {
        
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }

        if (result.hasErrors()) {
            model.addAttribute("user", currentUser.get());
            return "profile/change-password";
        }

        try {
            userService.changePassword(passwordChangeDto);
            redirectAttributes.addFlashAttribute("success", "Password changed successfully!");
            log.info("Password changed for user: {}", currentUser.get().getEmail());
            return "redirect:/profile";
            
        } catch (RuntimeException e) {
            model.addAttribute("user", currentUser.get());
            model.addAttribute("error", e.getMessage());
            return "profile/change-password";
        }
    }
} 