package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.FacultyService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
public class AdminCourseController {
    
    private final CourseService courseService;
    private final FacultyService facultyService;
    
    @Autowired
    public AdminCourseController(CourseService courseService, FacultyService facultyService) {
        this.courseService = courseService;
        this.facultyService = facultyService;
    }
    
    // List all courses
    @GetMapping("/admin/courses")
    public String listCourses(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is an admin
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.ADMIN) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        List<Course> courses = courseService.getAllCourses();
        model.addAttribute("courses", courses);
        
        return "admin/courses";
    }
    
    // Show course form for creating a new course
    @GetMapping("/admin/courses/create")
    public String showCreateCourseForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is an admin
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.ADMIN) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Add empty course to model
        model.addAttribute("course", new Course());
        
        // Add faculties for dropdown
        List<Faculty> faculties = facultyService.getAllFaculty();
        model.addAttribute("faculties", faculties);
        model.addAttribute("isNew", true);
        
        return "admin/course-form";
    }
    
    // Show course form for editing an existing course
    @GetMapping("/admin/courses/edit/{id}")
    public String showEditCourseForm(@PathVariable Long id, HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is an admin
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.ADMIN) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get course by id
        Optional<Course> courseOpt = courseService.getCourseById(id);
        
        if (courseOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Course not found");
            return "redirect:/admin/courses";
        }
        
        model.addAttribute("course", courseOpt.get());
        
        // Add faculties for dropdown
        List<Faculty> faculties = facultyService.getAllFaculty();
        model.addAttribute("faculties", faculties);
        model.addAttribute("isNew", false);
        
        return "admin/course-form";
    }
    
    // Save course (create/update)
    @PostMapping("/admin/courses/save")
    public String saveCourse(@ModelAttribute Course course, HttpSession session, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is an admin
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.ADMIN) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        try {
            // Save course
            courseService.saveCourse(course);
            redirectAttributes.addFlashAttribute("success", "Course saved successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to save course: " + e.getMessage());
        }
        
        return "redirect:/admin/courses";
    }
    
    // Delete course
    @PostMapping("/admin/courses/delete/{id}")
    public String deleteCourse(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is an admin
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.ADMIN) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        try {
            // Check if course exists
            Optional<Course> courseOpt = courseService.getCourseById(id);
            
            if (courseOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Course not found");
                return "redirect:/admin/courses";
            }
            
            // Delete course
            courseService.deleteCourse(id);
            redirectAttributes.addFlashAttribute("success", "Course deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete course: " + e.getMessage());
        }
        
        return "redirect:/admin/courses";
    }
} 