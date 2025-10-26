package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.UserRegistrationDto;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.service.ClubService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final ClubService clubService;

    @GetMapping("/")
    public String home() {
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            return "redirect:/dashboard";
        }
        return "index"; // Serve the homepage for unauthenticated users
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                           @RequestParam(value = "logout", required = false) String logout,
                           Model model) {
        
        // If user is already logged in, redirect to dashboard
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            return "redirect:/dashboard";
        }

        if (error != null) {
            model.addAttribute("error", "Invalid email or password");
        }
        
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully");
        }

        return "auth/login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        // If user is already logged in, redirect to dashboard
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isPresent()) {
            return "redirect:/dashboard";
        }

        model.addAttribute("user", new UserRegistrationDto());
        return "auth/register";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") UserRegistrationDto userDto,
                              BindingResult result,
                              Model model,
                              RedirectAttributes redirectAttributes) {
        
        // Check for validation errors
        if (result.hasErrors()) {
            return "auth/register";
        }

        try {
            User registeredUser = userService.registerUser(userDto);
            redirectAttributes.addFlashAttribute("message", 
                "Registration successful! Please login with your credentials.");
            log.info("User registered successfully: {}", registeredUser.getEmail());
            return "redirect:/login";
            
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "auth/register";
        }
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        Optional<User> currentUser = userService.getCurrentUser();
        if (currentUser.isEmpty()) {
            return "redirect:/login";
        }

        User user = currentUser.get();
        model.addAttribute("user", user);
        
        // Add role-specific data
        if (user.isSystemAdmin()) {
            model.addAttribute("userStats", userService.getUserStats());
            model.addAttribute("clubStats", clubService.getClubStats());
        } else if (user.isClubAdmin()) {
            model.addAttribute("myClubs", clubService.getClubsByAdmin(user));
        } else if (user.isStudent()) {
            model.addAttribute("activeClubs", clubService.getActiveClubs());
        }

        return "dashboard/dashboard";
    }
} 