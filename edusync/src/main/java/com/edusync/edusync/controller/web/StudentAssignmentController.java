package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.Submission;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.AssignmentService;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.StudentService;
import com.edusync.edusync.service.SubmissionService;
import com.edusync.edusync.service.FacultyService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

@Controller
public class StudentAssignmentController {

    private final AssignmentService assignmentService;
    private final CourseService courseService;
    private final StudentService studentService;
    private final SubmissionService submissionService;
    private final FacultyService facultyService;

    @Autowired
    public StudentAssignmentController(AssignmentService assignmentService, CourseService courseService,
                                      StudentService studentService, SubmissionService submissionService,
                                      FacultyService facultyService) {
        this.assignmentService = assignmentService;
        this.courseService = courseService;
        this.studentService = studentService;
        this.submissionService = submissionService;
        this.facultyService = facultyService;
    }

    // List all assignments for student
    @GetMapping("/student/assignments")
    public String listAssignments(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a student
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.STUDENT) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get student details
        Optional<Student> studentOpt = studentService.getStudentByUser(user);
        
        if (studentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Student profile not found");
            return "redirect:/student/dashboard";
        }
        
        Student student = studentOpt.get();
        model.addAttribute("student", student);
        
        // Get all enrolled courses
        Set<Course> courses = student.getCourses();
        
        // Collect all assignments from enrolled courses
        List<Assignment> allAssignments = new ArrayList<>();
        if (courses != null && !courses.isEmpty()) {
            for (Course course : courses) {
                allAssignments.addAll(assignmentService.getAssignmentsByCourse(course));
            }
        }
        
        // Get submission status for each assignment
        if (!allAssignments.isEmpty()) {
            List<Submission> studentSubmissions = submissionService.getSubmissionsByStudent(student);
            model.addAttribute("studentSubmissions", studentSubmissions);
            
            // Create map of assignment ID to status for easier access in the template
            Map<Long, String> assignmentStatusMap = new HashMap<>();
            Map<Long, Submission> submissionMap = new HashMap<>();
            
            // Track submissions for each assignment
            for (Submission submission : studentSubmissions) {
                submissionMap.put(submission.getAssignment().getId(), submission);
            }
            
            // Determine status for each assignment
            LocalDate today = LocalDate.now();
            for (Assignment assignment : allAssignments) {
                String status;
                Submission submission = submissionMap.get(assignment.getId());
                
                if (submission != null) {
                    if (submission.getGraded()) {
                        status = "graded";
                    } else {
                        status = "submitted";
                    }
                } else if (assignment.getDueDate().isBefore(today)) {
                    status = "overdue";
                } else {
                    status = "pending";
                }
                
                assignmentStatusMap.put(assignment.getId(), status);
            }
            
            model.addAttribute("assignmentStatusMap", assignmentStatusMap);
            model.addAttribute("submissionMap", submissionMap);
        }
        
        model.addAttribute("assignments", allAssignments);
        
        return "student/assignments";
    }
    
    // View assignment details and submission form
    @GetMapping("/student/assignments/{id}")
    public String viewAssignment(@PathVariable Long id, HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a student
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.STUDENT) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get student details
        Optional<Student> studentOpt = studentService.getStudentByUser(user);
        
        if (studentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Student profile not found");
            return "redirect:/student/dashboard";
        }
        
        Student student = studentOpt.get();
        
        // Get assignment
        Optional<Assignment> assignmentOpt = assignmentService.getAssignmentById(id);
        
        if (assignmentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Assignment not found");
            return "redirect:/student/assignments";
        }
        
        Assignment assignment = assignmentOpt.get();
        
        // Verify student is enrolled in the course
        if (student.getCourses() == null || student.getCourses().stream()
                .noneMatch(course -> course.getId().equals(assignment.getCourse().getId()))) {
            redirectAttributes.addFlashAttribute("error", "You are not enrolled in this course");
            return "redirect:/student/assignments";
        }
        
        model.addAttribute("assignment", assignment);
        
        // Check if student has already submitted this assignment
        Optional<Submission> submissionOpt = submissionService.getSubmissionByAssignmentAndStudent(assignment, student);
        
        if (submissionOpt.isPresent()) {
            model.addAttribute("submission", submissionOpt.get());
            model.addAttribute("hasSubmitted", true);
        } else {
            model.addAttribute("submission", new Submission());
            model.addAttribute("hasSubmitted", false);
        }
        
        return "student/view-assignment";
    }
    
    // Submit assignment
    @PostMapping("/student/assignments/{id}/submit")
    public String submitAssignment(
            @PathVariable Long id,
            @RequestParam String submissionContent,
            @RequestParam(required = false) MultipartFile file,
            HttpSession session, 
            RedirectAttributes redirectAttributes) {
        
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a student
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.STUDENT) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get student details
        Optional<Student> studentOpt = studentService.getStudentByUser(user);
        
        if (studentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Student profile not found");
            return "redirect:/student/dashboard";
        }
        
        Student student = studentOpt.get();
        
        // Get assignment
        Optional<Assignment> assignmentOpt = assignmentService.getAssignmentById(id);
        
        if (assignmentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Assignment not found");
            return "redirect:/student/assignments";
        }
        
        Assignment assignment = assignmentOpt.get();
        
        // Verify student is enrolled in the course
        if (student.getCourses() == null || student.getCourses().stream()
                .noneMatch(course -> course.getId().equals(assignment.getCourse().getId()))) {
            redirectAttributes.addFlashAttribute("error", "You are not enrolled in this course");
            return "redirect:/student/assignments";
        }
        
        try {
            // Check if student has already submitted this assignment
            Optional<Submission> existingSubmissionOpt = submissionService.getSubmissionByAssignmentAndStudent(assignment, student);
            
            Submission submission;
            
            if (existingSubmissionOpt.isPresent()) {
                // Update existing submission
                submission = existingSubmissionOpt.get();
                submission.setSubmissionContent(submissionContent);
                submission.setSubmissionDate(LocalDateTime.now());
                submission.setGraded(false); // Reset graded status as it's a new submission
                
                redirectAttributes.addFlashAttribute("success", "Assignment resubmitted successfully");
            } else {
                // Create new submission
                submission = new Submission();
                submission.setAssignment(assignment);
                submission.setStudent(student);
                submission.setSubmissionContent(submissionContent);
                submission.setSubmissionDate(LocalDateTime.now());
                submission.setGraded(false);
                
                redirectAttributes.addFlashAttribute("success", "Assignment submitted successfully");
            }
            
            // Handle file upload if a file was provided
            if (file != null && !file.isEmpty()) {
                if (file.getSize() > 16 * 1024 * 1024) { // 16MB max file size
                    redirectAttributes.addFlashAttribute("error", "File size exceeds the maximum limit of 16MB");
                    return "redirect:/student/assignments/" + id;
                }
                
                submission.setFileName(file.getOriginalFilename());
                submission.setFileContentType(file.getContentType());
                submission.setFileData(file.getBytes());
            }
            
            // Save submission
            submissionService.saveSubmission(submission);
            
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to submit assignment: " + e.getMessage());
        }
        
        return "redirect:/student/assignments/" + id;
    }
    
    // View submission details and grades
    @GetMapping("/student/submissions/{id}")
    public String viewSubmission(@PathVariable Long id, HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a student
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.STUDENT) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to access this page");
            return "redirect:/";
        }
        
        // Get student details
        Optional<Student> studentOpt = studentService.getStudentByUser(user);
        
        if (studentOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Student profile not found");
            return "redirect:/student/dashboard";
        }
        
        Student student = studentOpt.get();
        
        // Get submission
        Optional<Submission> submissionOpt = submissionService.getSubmissionById(id);
        
        if (submissionOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Submission not found");
            return "redirect:/student/assignments";
        }
        
        Submission submission = submissionOpt.get();
        
        // Verify this submission belongs to the student
        if (!submission.getStudent().getId().equals(student.getId())) {
            redirectAttributes.addFlashAttribute("error", "You can only view your own submissions");
            return "redirect:/student/assignments";
        }
        
        model.addAttribute("submission", submission);
        model.addAttribute("assignment", submission.getAssignment());
        
        return "student/view-submission";
    }

    // Download submission file
    @GetMapping("/student/submissions/{id}/download")
    public ResponseEntity<byte[]> downloadSubmissionFile(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get submission
        Optional<Submission> submissionOpt = submissionService.getSubmissionById(id);
        
        if (submissionOpt.isEmpty() || submissionOpt.get().getFileData() == null) {
            return ResponseEntity.notFound().build();
        }
        
        Submission submission = submissionOpt.get();
        
        // Check if user is authorized to download this file
        boolean isAuthorized = false;
        
        // Student can download their own submission
        if (user.getRole() == User.Role.STUDENT) {
            Optional<Student> studentOpt = studentService.getStudentByUser(user);
            if (studentOpt.isPresent() && studentOpt.get().getId().equals(submission.getStudent().getId())) {
                isAuthorized = true;
            }
        }
        
        // Faculty can download if they teach the course
        if (user.getRole() == User.Role.FACULTY) {
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isPresent() && 
                submission.getAssignment().getCourse().getFaculty() != null &&
                facultyOpt.get().getId().equals(submission.getAssignment().getCourse().getFaculty().getId())) {
                isAuthorized = true;
            }
        }
        
        // Admin can download any file
        if (user.getRole() == User.Role.ADMIN) {
            isAuthorized = true;
        }
        
        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Prepare file download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(submission.getFileContentType()));
        headers.setContentDispositionFormData("attachment", submission.getFileName());
        
        return new ResponseEntity<>(submission.getFileData(), headers, HttpStatus.OK);
    }
} 