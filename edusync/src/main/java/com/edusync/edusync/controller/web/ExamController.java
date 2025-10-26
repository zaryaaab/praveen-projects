package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Exam;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.ExamService;
import com.edusync.edusync.service.FacultyService;
import com.edusync.edusync.service.StudentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Controller
public class ExamController {
    
    private final ExamService examService;
    private final CourseService courseService;
    private final FacultyService facultyService;
    private final StudentService studentService;
    
    @Autowired
    public ExamController(ExamService examService, CourseService courseService, 
                         FacultyService facultyService, StudentService studentService) {
        this.examService = examService;
        this.courseService = courseService;
        this.facultyService = facultyService;
        this.studentService = studentService;
    }
    
    // Faculty: Manage exams
    @GetMapping("/faculty/exams")
    public String facultyExams(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
            
            // Get faculty courses
            if (faculty.getCourses() != null) {
                model.addAttribute("courses", faculty.getCourses());
                
                // Get all exams for faculty courses
                List<Exam> allExams = new ArrayList<>();
                for (Course course : faculty.getCourses()) {
                    allExams.addAll(examService.getExamsByCourse(course));
                }
                model.addAttribute("exams", allExams);
            }
        }
        
        return "faculty/exams";
    }
    
    // Faculty: Create a new exam
    @GetMapping("/faculty/exams/create")
    public String showCreateExamForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
            
            // Get faculty courses for dropdown
            if (faculty.getCourses() != null) {
                model.addAttribute("courses", faculty.getCourses());
            }
            
            // Add exam types for dropdown
            model.addAttribute("examTypes", new String[]{"Quiz", "Midterm", "Final", "Assignment", "Project", "Other"});
        }
        
        // Add new exam object
        model.addAttribute("exam", new Exam());
        
        return "faculty/create-exam";
    }
    
    // Faculty: Save a new exam
    @PostMapping("/faculty/exams/create")
    public String createExam(
            @RequestParam("courseId") Long courseId,
            @RequestParam("examTitle") String examTitle,
            @RequestParam("examDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate,
            @RequestParam("examTime") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime examTime,
            @RequestParam("examDuration") String examDuration,
            @RequestParam("location") String location,
            @RequestParam("examType") String examType,
            @RequestParam("totalMarks") Integer totalMarks,
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
            redirectAttributes.addFlashAttribute("error", "Faculty details not found");
            return "redirect:/faculty/exams";
        }
        
        Faculty faculty = facultyOpt.get();
        
        try {
            // Get the course
            Optional<Course> courseOpt = courseService.getCourseById(courseId);
            if (courseOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Course not found");
                return "redirect:/faculty/exams/create";
            }
            
            Course course = courseOpt.get();
            
            // Check if the course belongs to this faculty
            if (faculty.getCourses() == null || !faculty.getCourses().contains(course)) {
                redirectAttributes.addFlashAttribute("error", "You don't have permission to create exams for this course");
                return "redirect:/faculty/exams";
            }
            
            // Create and save the exam
            Exam exam = new Exam();
            exam.setExamTitle(examTitle);
            exam.setCourse(course);
            exam.setExamDate(LocalDateTime.of(examDate, examTime));
            exam.setExamDuration(examDuration);
            exam.setLocation(location);
            exam.setExamType(examType);
            exam.setTotalMarks(totalMarks);
            
            examService.saveExam(exam);
            
            redirectAttributes.addFlashAttribute("success", "Exam created successfully");
            return "redirect:/faculty/exams";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to create exam: " + e.getMessage());
            return "redirect:/faculty/exams/create";
        }
    }
    
    // Faculty: Delete an exam
    @PostMapping("/faculty/exams/delete/{id}")
    public String deleteExam(
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
        
        // Get faculty details
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        if (facultyOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Faculty details not found");
            return "redirect:/faculty/exams";
        }
        
        Faculty faculty = facultyOpt.get();
        
        try {
            // Get the exam
            Optional<Exam> examOpt = examService.getExamById(id);
            if (examOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Exam not found");
                return "redirect:/faculty/exams";
            }
            
            Exam exam = examOpt.get();
            
            // Check if the exam's course belongs to this faculty
            if (faculty.getCourses() == null || !faculty.getCourses().contains(exam.getCourse())) {
                redirectAttributes.addFlashAttribute("error", "You don't have permission to delete this exam");
                return "redirect:/faculty/exams";
            }
            
            // Delete the exam
            examService.deleteExam(id);
            
            redirectAttributes.addFlashAttribute("success", "Exam deleted successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to delete exam: " + e.getMessage());
        }
        
        return "redirect:/faculty/exams";
    }
    
    // Student: View exam schedule
    @GetMapping("/student/exams")
    public String studentExams(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            model.addAttribute("student", student);
            
            // Get student courses
            if (student.getCourses() != null && !student.getCourses().isEmpty()) {
                // Get upcoming exams for enrolled courses
                List<Exam> upcomingExams = new ArrayList<>();
                List<Exam> allExams = new ArrayList<>();
                
                for (Course course : student.getCourses()) {
                    // Add upcoming exams (future dates)
                    upcomingExams.addAll(examService.getUpcomingExamsByCourse(course));
                    
                    // Add all exams regardless of date
                    allExams.addAll(examService.getExamsByCourse(course));
                }
                
                model.addAttribute("upcomingExams", upcomingExams);
                model.addAttribute("allExams", allExams);
            } else {
                // Ensure model has empty lists rather than null values
                model.addAttribute("upcomingExams", new ArrayList<Exam>());
                model.addAttribute("allExams", new ArrayList<Exam>());
            }
        } else {
            // Ensure model has empty lists rather than null values
            model.addAttribute("upcomingExams", new ArrayList<Exam>());
            model.addAttribute("allExams", new ArrayList<Exam>());
        }
        
        return "student/exams";
    }
} 