package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Submission;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.AssignmentService;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.FacultyService;
import com.edusync.edusync.service.SubmissionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Controller
public class FacultyAssignmentController {

    private final AssignmentService assignmentService;
    private final CourseService courseService;
    private final FacultyService facultyService;
    private final SubmissionService submissionService;

    @Autowired
    public FacultyAssignmentController(AssignmentService assignmentService, CourseService courseService,
                                      FacultyService facultyService, SubmissionService submissionService) {
        this.assignmentService = assignmentService;
        this.courseService = courseService;
        this.facultyService = facultyService;
        this.submissionService = submissionService;
    }

    // List all assignments for faculty
    @GetMapping("/faculty/assignments")
    public String listAssignments(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        Faculty faculty = facultyOpt.get();
        model.addAttribute("faculty", faculty);
        
        // Get all courses taught by this faculty
        List<Course> courses = courseService.getCoursesByFaculty(faculty);
        model.addAttribute("courses", courses);
        
        // Get assignments for all courses
        if (courses != null && !courses.isEmpty()) {
            List<Assignment> assignmentList = courses.stream()
                .flatMap(course -> assignmentService.getAssignmentsByCourse(course).stream())
                .toList();
            
            // Create a map of assignment IDs to submission counts
            // to avoid lazy loading issues in the template
            Map<Long, Integer> submissionCounts = new HashMap<>();
            for (Assignment assignment : assignmentList) {
                int count = submissionService.getSubmissionCountByAssignment(assignment);
                submissionCounts.put(assignment.getId(), count);
            }
            
            model.addAttribute("assignments", assignmentList);
            model.addAttribute("submissionCounts", submissionCounts);
        }
        
        return "faculty/assignments";
    }
    
    // Show form to create new assignment
    @GetMapping("/faculty/assignments/create")
    public String showCreateForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        Faculty faculty = facultyOpt.get();
        
        // Get all courses taught by this faculty for dropdown
        List<Course> courses = courseService.getCoursesByFaculty(faculty);
        model.addAttribute("courses", courses);
        
        // Add empty assignment object
        model.addAttribute("assignment", new Assignment());
        
        return "faculty/create-assignment";
    }
    
    // Save new assignment
    @PostMapping("/faculty/assignments/save")
    public String saveAssignment(
            @ModelAttribute Assignment assignment,
            @RequestParam Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
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
        
        // Get faculty details
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        try {
            // Get course
            Optional<Course> courseOpt = courseService.getCourseById(courseId);
            
            if (courseOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Course not found");
                return "redirect:/faculty/assignments/create";
            }
            
            Course course = courseOpt.get();
            
            // Verify that this faculty teaches this course
            if (course.getFaculty() == null || !course.getFaculty().getId().equals(facultyOpt.get().getId())) {
                redirectAttributes.addFlashAttribute("error", "You can only create assignments for courses you teach");
                return "redirect:/faculty/assignments";
            }
            
            // Set course and due date
            assignment.setCourse(course);
            assignment.setDueDate(dueDate);
            
            // Save assignment
            assignmentService.saveAssignment(assignment);
            
            redirectAttributes.addFlashAttribute("success", "Assignment created successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to create assignment: " + e.getMessage());
        }
        
        return "redirect:/faculty/assignments";
    }
    
    // Show assignment details and submissions
    @GetMapping("/faculty/assignments/{id}")
    public String viewAssignment(@PathVariable Long id, HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        // Get assignment
        Optional<Assignment> assignmentOpt = assignmentService.getAssignmentById(id);
        
        if (assignmentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Assignment not found");
            return "redirect:/faculty/assignments";
        }
        
        Assignment assignment = assignmentOpt.get();
        
        // Verify that this faculty teaches the course of this assignment
        if (assignment.getCourse().getFaculty() == null || 
            !assignment.getCourse().getFaculty().getId().equals(facultyOpt.get().getId())) {
            redirectAttributes.addFlashAttribute("error", "You can only view assignments for courses you teach");
            return "redirect:/faculty/assignments";
        }
        
        // Get submissions for this assignment
        List<Submission> submissions = submissionService.getSubmissionsByAssignment(assignment);
        
        model.addAttribute("assignment", assignment);
        model.addAttribute("submissions", submissions);
        
        return "faculty/view-assignment";
    }
    
    // Grade a submission
    @PostMapping("/faculty/submissions/{id}/grade")
    public String gradeSubmission(
            @PathVariable Long id,
            @RequestParam Integer marks,
            @RequestParam String feedback,
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
        
        // Get faculty details
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        // Get submission
        Optional<Submission> submissionOpt = submissionService.getSubmissionById(id);
        
        if (submissionOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Submission not found");
            return "redirect:/faculty/assignments";
        }
        
        Submission submission = submissionOpt.get();
        
        // Verify that this faculty teaches the course of this assignment
        if (submission.getAssignment().getCourse().getFaculty() == null || 
            !submission.getAssignment().getCourse().getFaculty().getId().equals(facultyOpt.get().getId())) {
            redirectAttributes.addFlashAttribute("error", "You can only grade submissions for courses you teach");
            return "redirect:/faculty/assignments";
        }
        
        try {
            // Grade submission
            submissionService.gradeSubmission(submission, marks, feedback);
            
            redirectAttributes.addFlashAttribute("success", "Submission graded successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to grade submission: " + e.getMessage());
        }
        
        return "redirect:/faculty/assignments/" + submission.getAssignment().getId();
    }
    
    // Delete an assignment
    @PostMapping("/faculty/assignments/{id}/delete")
    public String deleteAssignment(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
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
        
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty profile not found");
            return "redirect:/faculty/dashboard";
        }
        
        // Get assignment
        Optional<Assignment> assignmentOpt = assignmentService.getAssignmentById(id);
        
        if (assignmentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Assignment not found");
            return "redirect:/faculty/assignments";
        }
        
        Assignment assignment = assignmentOpt.get();
        
        // Verify that this faculty teaches the course of this assignment
        if (assignment.getCourse().getFaculty() == null || 
            !assignment.getCourse().getFaculty().getId().equals(facultyOpt.get().getId())) {
            redirectAttributes.addFlashAttribute("error", "You can only delete assignments for courses you teach");
            return "redirect:/faculty/assignments";
        }
        
        try {
            // Delete assignment
            assignmentService.deleteAssignment(id);
            
            redirectAttributes.addFlashAttribute("success", "Assignment deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete assignment: " + e.getMessage());
        }
        
        return "redirect:/faculty/assignments";
    }
} 