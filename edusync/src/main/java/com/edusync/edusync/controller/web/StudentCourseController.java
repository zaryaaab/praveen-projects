package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.StudentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
public class StudentCourseController {

    private final CourseService courseService;
    private final StudentService studentService;

    @Autowired
    public StudentCourseController(CourseService courseService, StudentService studentService) {
        this.courseService = courseService;
        this.studentService = studentService;
    }

    // Display available courses for enrollment
    @GetMapping("/student/available-courses")
    public String availableCourses(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        // Get all available courses
        List<Course> allCourses = courseService.getAllCourses();
        
        // Filter out courses that the student is already enrolled in
        Set<Course> enrolledCourses = student.getCourses();
        if (enrolledCourses == null) {
            enrolledCourses = new HashSet<>();
        }
        
        final Set<Course> finalEnrolledCourses = enrolledCourses;
        List<Course> availableCourses = allCourses.stream()
            .filter(course -> !finalEnrolledCourses.contains(course))
            .collect(Collectors.toList());
        
        model.addAttribute("availableCourses", availableCourses);
        
        return "student/available-courses";
    }
    
    // Enroll in a course
    @PostMapping("/student/enroll/{courseId}")
    public String enrollCourse(@PathVariable Long courseId, HttpSession session, RedirectAttributes redirectAttributes) {
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
        
        // Get course details
        Optional<Course> courseOpt = courseService.getCourseById(courseId);
        if (courseOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Course not found");
            return "redirect:/student/available-courses";
        }
        
        try {
            Student student = studentOpt.get();
            Course course = courseOpt.get();
            
            // Check if already enrolled
            if (student.getCourses() != null && student.getCourses().contains(course)) {
                redirectAttributes.addFlashAttribute("error", "You are already enrolled in this course");
                return "redirect:/student/courses";
            }
            
            // Add course to student's enrolled courses
            if (student.getCourses() == null) {
                student.setCourses(new HashSet<>());
            }
            student.getCourses().add(course);
            
            // Save student with new course enrollment
            studentService.saveStudent(student);
            
            redirectAttributes.addFlashAttribute("success", "Successfully enrolled in " + course.getCourseName());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to enroll in course: " + e.getMessage());
        }
        
        return "redirect:/student/courses";
    }
    
    // Drop a course
    @PostMapping("/student/drop/{courseId}")
    public String dropCourse(@PathVariable Long courseId, HttpSession session, RedirectAttributes redirectAttributes) {
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
        
        // Get course details
        Optional<Course> courseOpt = courseService.getCourseById(courseId);
        if (courseOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Course not found");
            return "redirect:/student/courses";
        }
        
        try {
            Student student = studentOpt.get();
            Course course = courseOpt.get();
            
            // Check if actually enrolled
            if (student.getCourses() == null || !student.getCourses().contains(course)) {
                redirectAttributes.addFlashAttribute("error", "You are not enrolled in this course");
                return "redirect:/student/courses";
            }
            
            // Remove course from student's enrolled courses
            student.getCourses().remove(course);
            
            // Save student with updated course enrollment
            studentService.saveStudent(student);
            
            redirectAttributes.addFlashAttribute("success", "Successfully dropped " + course.getCourseName());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to drop course: " + e.getMessage());
        }
        
        return "redirect:/student/courses";
    }
} 