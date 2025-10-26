package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.OfficeHours;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.FacultyService;
import com.edusync.edusync.service.OfficeHoursService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Controller
public class OfficeHoursController {
    
    private final OfficeHoursService officeHoursService;
    private final FacultyService facultyService;
    
    @Autowired
    public OfficeHoursController(OfficeHoursService officeHoursService, FacultyService facultyService) {
        this.officeHoursService = officeHoursService;
        this.facultyService = facultyService;
    }
    
    // Faculty: View and manage office hours
    @GetMapping("/faculty/office-hours")
    public String facultyOfficeHours(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a faculty
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.FACULTY) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get faculty details
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            model.addAttribute("faculty", faculty);
            
            // Get current office hours
            List<OfficeHours> officeHoursList = officeHoursService.getOfficeHoursForFaculty(faculty);
            model.addAttribute("officeHoursList", officeHoursList);
            
            // Add empty OfficeHours object for the form
            model.addAttribute("newOfficeHours", new OfficeHours());
            
            // Add days of week for dropdown
            model.addAttribute("daysOfWeek", DayOfWeek.values());
        }
        
        return "faculty/office-hours";
    }
    
    // Faculty: Add new office hours
    @PostMapping("/faculty/office-hours/add")
    public String addOfficeHours(
            @RequestParam("dayOfWeek") DayOfWeek dayOfWeek,
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "notes", required = false) String notes,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a faculty
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.FACULTY) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Validate time inputs
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            redirectAttributes.addFlashAttribute("error", "Start time must be before end time");
            return "redirect:/faculty/office-hours";
        }
        
        try {
            // Get faculty details
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Faculty details not found");
                return "redirect:/faculty/office-hours";
            }
            
            Faculty faculty = facultyOpt.get();
            
            // Add new office hours
            officeHoursService.addOfficeHours(faculty, dayOfWeek, startTime, endTime, location, notes);
            
            redirectAttributes.addFlashAttribute("success", "Office hours added successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to add office hours: " + e.getMessage());
        }
        
        return "redirect:/faculty/office-hours";
    }
    
    // Faculty: Delete office hours
    @PostMapping("/faculty/office-hours/delete/{id}")
    public String deleteOfficeHours(
            @PathVariable Long id,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a faculty
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.FACULTY) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        try {
            // Get faculty details
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Faculty details not found");
                return "redirect:/faculty/office-hours";
            }
            
            Faculty faculty = facultyOpt.get();
            
            // Get the office hours to delete
            Optional<OfficeHours> officeHoursOpt = officeHoursService.getOfficeHoursById(id);
            if (officeHoursOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Office hours not found");
                return "redirect:/faculty/office-hours";
            }
            
            // Check if the office hours belong to this faculty
            OfficeHours officeHours = officeHoursOpt.get();
            if (!officeHours.getFaculty().getId().equals(faculty.getId())) {
                redirectAttributes.addFlashAttribute("error", "You don't have permission to delete these office hours");
                return "redirect:/faculty/office-hours";
            }
            
            // Delete office hours
            officeHoursService.deleteOfficeHours(id);
            
            redirectAttributes.addFlashAttribute("success", "Office hours deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete office hours: " + e.getMessage());
        }
        
        return "redirect:/faculty/office-hours";
    }
    
    // Student: View all faculty office hours
    @GetMapping("/faculty-directory")
    public String viewFacultyDirectory(HttpSession session, Model model) {
        // Add user to model if logged in
        if (session.getAttribute("user") != null) {
            model.addAttribute("sessionUser", session.getAttribute("user"));
        }
        
        // Get all faculty
        List<Faculty> facultyList = facultyService.getAllFaculty();
        model.addAttribute("facultyList", facultyList);
        
        return "faculty-directory";
    }
    
    // Student: View specific faculty office hours
    @GetMapping("/faculty-profile/{id}")
    public String viewFacultyProfile(@PathVariable Long id, HttpSession session, Model model) {
        // Add user to model if logged in
        if (session.getAttribute("user") != null) {
            model.addAttribute("sessionUser", session.getAttribute("user"));
        }
        
        // Get faculty details
        Optional<Faculty> facultyOpt = facultyService.getFacultyById(id);
        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            model.addAttribute("faculty", faculty);
            
            // Get office hours
            List<OfficeHours> officeHoursList = officeHoursService.getOfficeHoursForFaculty(faculty);
            model.addAttribute("officeHoursList", officeHoursList);
        }
        
        return "faculty-profile";
    }
} 