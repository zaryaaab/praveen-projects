package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.FacultyService;
import com.edusync.edusync.service.StudentService;
import com.edusync.edusync.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class AuthController {
    
    private final UserService userService;
    private final StudentService studentService;
    private final FacultyService facultyService;
    
    @Autowired
    public AuthController(UserService userService, StudentService studentService, 
                         FacultyService facultyService) {
        this.userService = userService;
        this.studentService = studentService;
        this.facultyService = facultyService;
    }
    
    @GetMapping("/login")
    public String loginPage(HttpSession session, RedirectAttributes redirectAttributes) {
        // Check if user is already logged in
        if (session.getAttribute("user") != null) {
            redirectAttributes.addFlashAttribute("info", "You are already logged in");
            return redirectToUserDashboard((User)session.getAttribute("user"));
        }
        return "auth/login";
    }
    
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, 
                       RedirectAttributes redirectAttributes, HttpSession session) {
        Optional<User> userOpt = userService.getUserByUsername(username);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            
            // Store user in session
            session.setAttribute("user", user);
            
            // In a real application, we would use Spring Security for proper authentication
            // This is a simplified example
            
            if (user.getRole() == User.Role.STUDENT) {
                return "redirect:/student/dashboard";
            } else if (user.getRole() == User.Role.FACULTY) {
                return "redirect:/faculty/dashboard";
            } else if (user.getRole() == User.Role.ADMIN) {
                return "redirect:/admin/dashboard";
            }
        }
        
        redirectAttributes.addFlashAttribute("error", "Invalid username or password");
        return "redirect:/login";
    }
    
    @GetMapping("/register")
    public String registerPage(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        // Check if user is already logged in
        if (session.getAttribute("user") != null) {
            redirectAttributes.addFlashAttribute("info", "You are already logged in");
            return redirectToUserDashboard((User)session.getAttribute("user"));
        }
        model.addAttribute("user", new User());
        return "auth/register";
    }
    
    @PostMapping("/register")
    public String register(@ModelAttribute User user, @RequestParam String confirmPassword,
                          @RequestParam String userRole, @RequestParam(required = false) String studentId,
                          @RequestParam(required = false) String facultyId,
                          RedirectAttributes redirectAttributes) {
        
        // Validate inputs
        if (!user.getPassword().equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "Passwords do not match");
            return "redirect:/register";
        }
        
        if (userService.existsByUsername(user.getUsername())) {
            redirectAttributes.addFlashAttribute("error", "Username already exists");
            return "redirect:/register";
        }
        
        if (userService.existsByEmail(user.getEmail())) {
            redirectAttributes.addFlashAttribute("error", "Email already exists");
            return "redirect:/register";
        }
        
        // Set role and validate role-specific fields
        if ("student".equals(userRole)) {
            user.setRole(User.Role.STUDENT);
            if (studentId == null || studentId.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Student ID is required");
                return "redirect:/register";
            }
        } else if ("faculty".equals(userRole)) {
            user.setRole(User.Role.FACULTY);
            if (facultyId == null || facultyId.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Faculty ID is required");
                return "redirect:/register";
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid role selected");
            return "redirect:/register";
        }
        
        try {
            // Save user
            User savedUser = userService.saveUser(user);
            
            // Create student or faculty profile
            if (user.getRole() == User.Role.STUDENT) {
                Student student = new Student();
                student.setUser(savedUser);
                student.setStudentId(studentId);
                studentService.saveStudent(student);
            } else if (user.getRole() == User.Role.FACULTY) {
                Faculty faculty = new Faculty();
                faculty.setUser(savedUser);
                faculty.setFacultyId(facultyId);
                facultyService.saveFaculty(faculty);
            }
            
            redirectAttributes.addFlashAttribute("success", "Registration successful. Please log in.");
            return "redirect:/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Registration failed: " + e.getMessage());
            return "redirect:/register";
        }
    }
    
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        // In a real app, we would use Spring Security for logout
        session.invalidate();
        return "redirect:/login";
    }
    
    // Helper method to redirect to appropriate dashboard based on user role
    private String redirectToUserDashboard(User user) {
        if (user.getRole() == User.Role.STUDENT) {
            return "redirect:/student/dashboard";
        } else if (user.getRole() == User.Role.FACULTY) {
            return "redirect:/faculty/dashboard";
        } else if (user.getRole() == User.Role.ADMIN) {
            return "redirect:/admin/dashboard";
        }
        return "redirect:/";
    }
} 