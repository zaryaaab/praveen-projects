package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.User;
import com.edusync.edusync.model.Exam;
import com.edusync.edusync.model.CourseSchedule;
import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.service.AnnouncementService;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.ExamService;
import com.edusync.edusync.service.FacultyService;
import com.edusync.edusync.service.StudentService;
import com.edusync.edusync.service.UserService;
import com.edusync.edusync.service.TimetableService;
import com.edusync.edusync.service.DataInitializerService;
import com.edusync.edusync.service.AssignmentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.DayOfWeek;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.stream.Collectors;

@Controller
public class HomeController {
    
    private final StudentService studentService;
    private final FacultyService facultyService;
    private final CourseService courseService;
    private final AnnouncementService announcementService;
    private final UserService userService;
    private final ExamService examService;
    private final TimetableService timetableService;
    private final DataInitializerService dataInitializerService;
    private final AssignmentService assignmentService;
    
    @Autowired
    public HomeController(StudentService studentService, FacultyService facultyService, 
                          CourseService courseService, AnnouncementService announcementService,
                          UserService userService, ExamService examService, 
                          TimetableService timetableService, DataInitializerService dataInitializerService,
                          AssignmentService assignmentService) {
        this.studentService = studentService;
        this.facultyService = facultyService;
        this.courseService = courseService;
        this.announcementService = announcementService;
        this.userService = userService;
        this.examService = examService;
        this.timetableService = timetableService;
        this.dataInitializerService = dataInitializerService;
        this.assignmentService = assignmentService;
    }
    
    @GetMapping("/")
    public String home(Model model, HttpSession session) {
        // Add user to model if logged in
        if (session.getAttribute("user") != null) {
            model.addAttribute("sessionUser", session.getAttribute("user"));
        }
        return "home";
    }
    
    @GetMapping("/student/dashboard")
    public String studentDashboard(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
            model.addAttribute("courses", student.getCourses().size());
            
            // Initialize timetable data for the student if needed
            dataInitializerService.initializeScheduleData(student);
            
            // Get recent announcements
            model.addAttribute("announcements", announcementService.getRecentAnnouncements());
            
            // Get upcoming exams
            if (student.getCourses() != null) {
                List<Exam> upcomingExams = new ArrayList<>();
                for (Course course : student.getCourses()) {
                    upcomingExams.addAll(examService.getUpcomingExamsByCourse(course));
                }
                model.addAttribute("upcomingExams", upcomingExams);
                model.addAttribute("examCount", upcomingExams.size());
                
                // Get assignments for enrolled courses
                List<Assignment> allAssignments = new ArrayList<>();
                List<Assignment> upcomingAssignments = new ArrayList<>();
                LocalDate today = LocalDate.now();
                
                for (Course course : student.getCourses()) {
                    List<Assignment> courseAssignments = assignmentService.getAssignmentsByCourse(course);
                    allAssignments.addAll(courseAssignments);
                    
                    // Filter for upcoming assignments (due date is in the future)
                    upcomingAssignments.addAll(courseAssignments.stream()
                        .filter(a -> a.getDueDate().isAfter(today))
                        .sorted(Comparator.comparing(Assignment::getDueDate))
                        .collect(Collectors.toList()));
                }
                
                model.addAttribute("assignmentCount", allAssignments.size());
                model.addAttribute("upcomingAssignments", upcomingAssignments);
                
                // Get today's timetable
                DayOfWeek todayDayOfWeek = DayOfWeek.from(java.time.LocalDate.now());
                List<CourseSchedule> todaySchedules = timetableService.getSchedulesForStudentByDay(student, todayDayOfWeek);
                todaySchedules.sort(Comparator.comparing(CourseSchedule::getStartTime));
                model.addAttribute("todaySchedules", todaySchedules);
                
                // Get all schedules for the whole week
                List<CourseSchedule> allSchedules = timetableService.getSchedulesForStudent(student);
                Map<DayOfWeek, List<CourseSchedule>> weekSchedules = timetableService.organizeSchedulesByDay(allSchedules);
                model.addAttribute("weekSchedules", weekSchedules);
                
                // For simplified timetable display
                List<DayOfWeek> weekdays = Arrays.asList(
                    DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
                );
                model.addAttribute("weekdays", weekdays);
                
                // Add current day of week and mapping for consistency with TimetableController
                model.addAttribute("currentDayOfWeek", todayDayOfWeek);
                model.addAttribute("currentDayOfWeekName", todayDayOfWeek.name());
                
                // Add day of week map
                Map<String, DayOfWeek> dayOfWeekMap = new HashMap<>();
                dayOfWeekMap.put("MONDAY", DayOfWeek.MONDAY);
                dayOfWeekMap.put("TUESDAY", DayOfWeek.TUESDAY);
                dayOfWeekMap.put("WEDNESDAY", DayOfWeek.WEDNESDAY);
                dayOfWeekMap.put("THURSDAY", DayOfWeek.THURSDAY);
                dayOfWeekMap.put("FRIDAY", DayOfWeek.FRIDAY);
                dayOfWeekMap.put("SATURDAY", DayOfWeek.SATURDAY);
                dayOfWeekMap.put("SUNDAY", DayOfWeek.SUNDAY);
                model.addAttribute("dayOfWeekMap", dayOfWeekMap);
            } else {
                model.addAttribute("examCount", 0);
            }
        }
        
        return "student/dashboard";
    }
    
    @GetMapping("/faculty/dashboard")
    public String facultyDashboard(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        // Get faculty details and courses
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            model.addAttribute("faculty", faculty);
            model.addAttribute("user", user);
            
            // Add count statistics
            int courseCount = faculty.getCourses() != null ? faculty.getCourses().size() : 0;
            model.addAttribute("courseCount", courseCount);
            
            // Count total students across all courses
            int studentCount = 0;
            if (faculty.getCourses() != null) {
                for (Course course : faculty.getCourses()) {
                    if (course.getStudents() != null) {
                        studentCount += course.getStudents().size();
                    }
                }
            }
            model.addAttribute("studentCount", studentCount);
            
            // Get recent announcements
            model.addAttribute("announcements", announcementService.getRecentAnnouncements());
            model.addAttribute("facultyAnnouncements", announcementService.getAnnouncementsByFaculty(faculty));
            
            // Count assignments for faculty courses
            int assignmentCount = 0;
            if (faculty.getCourses() != null) {
                for (Course course : faculty.getCourses()) {
                    assignmentCount += assignmentService.getAssignmentsByCourse(course).size();
                }
            }
            model.addAttribute("assignmentCount", assignmentCount);
            
            // Count exams for faculty courses
            int examCount = 0;
            if (faculty.getCourses() != null) {
                for (Course course : faculty.getCourses()) {
                    examCount += examService.getExamsByCourse(course).size();
                }
            }
            model.addAttribute("examCount", examCount);
        }
        
        return "faculty/dashboard";
    }
    
    @GetMapping("/admin/dashboard")
    public String adminDashboard(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        // Add user data to model
        model.addAttribute("user", user);
        
        // Get recent announcements
        model.addAttribute("announcements", announcementService.getRecentAnnouncements());
        
        // Add count statistics (these would typically come from service methods)
        // For now we're using placeholders
        try {
            model.addAttribute("studentCount", studentService.getAllStudents().size());
            model.addAttribute("facultyCount", facultyService.getAllFaculty().size());
            model.addAttribute("courseCount", courseService.getAllCourses().size());
            model.addAttribute("announcementCount", announcementService.getAllAnnouncements().size());
        } catch (Exception e) {
            // Handle any exceptions that might occur when retrieving counts
            model.addAttribute("error", "Error loading dashboard data: " + e.getMessage());
        }
        
        return "admin/dashboard";
    }
    
    @GetMapping("/profile")
    public String profile(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        model.addAttribute("user", user);
        
        // If user is a student, get student details
        if (user.getRole() == User.Role.STUDENT) {
            Optional<Student> studentOpt = studentService.getStudentByUser(user);
            if (studentOpt.isPresent()) {
                model.addAttribute("student", studentOpt.get());
            }
        }
        // If user is faculty, get faculty details
        else if (user.getRole() == User.Role.FACULTY) {
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isPresent()) {
                model.addAttribute("faculty", facultyOpt.get());
            }
        }
        
        return "profile";
    }
    
    @GetMapping("/student/courses")
    public String studentCourses(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        // Get student details and courses
        Optional<Student> studentOpt = studentService.getStudentByUser(user);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            model.addAttribute("student", student);
            model.addAttribute("courses", student.getCourses());
        }
        
        return "student/courses";
    }
    
    @GetMapping("/faculty/courses")
    public String facultyCourses(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
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
        
        // Get faculty details and courses
        Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            model.addAttribute("faculty", faculty);
            model.addAttribute("courses", faculty.getCourses());
        }
        
        return "faculty/courses";
    }
    
    @PostMapping("/faculty/dashboard")
    public String createAnnouncement(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "courseId", required = false) Long courseId,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in and is a faculty
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to create an announcement");
            return "redirect:/login";
        }
        
        if (user.getRole() != User.Role.FACULTY) {
            redirectAttributes.addFlashAttribute("error", "You don't have permission to create an announcement");
            return "redirect:/";
        }
        
        try {
            // Get faculty details
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "Faculty details not found");
                return "redirect:/faculty/dashboard";
            }
            
            Faculty faculty = facultyOpt.get();
            
            // Get course if courseId is provided
            Course course = null;
            if (courseId != null) {
                Optional<Course> courseOpt = courseService.getCourseById(courseId);
                if (courseOpt.isEmpty()) {
                    redirectAttributes.addFlashAttribute("error", "Course not found");
                    return "redirect:/faculty/dashboard";
                }
                course = courseOpt.get();
            }
            
            // Create announcement
            announcementService.createAnnouncement(title, content, faculty, course);
            
            redirectAttributes.addFlashAttribute("success", "Announcement created successfully");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to create announcement: " + e.getMessage());
        }
        
        return "redirect:/faculty/dashboard";
    }
    
    @GetMapping("/change-password")
    public String showChangePasswordForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        return "auth/change-password";
    }
    
    @PostMapping("/change-password")
    public String changePassword(
            @RequestParam("currentPassword") String currentPassword,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        // Validate current password
        if (!user.getPassword().equals(currentPassword)) {
            redirectAttributes.addFlashAttribute("error", "Current password is incorrect");
            return "redirect:/change-password";
        }
        
        // Validate new password and confirmation
        if (newPassword == null || newPassword.trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "New password cannot be empty");
            return "redirect:/change-password";
        }
        
        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "New password and confirmation do not match");
            return "redirect:/change-password";
        }
        
        try {
            // Update the password
            user.setPassword(newPassword);
            userService.saveUser(user);
            
            // Update the session with the updated user
            session.setAttribute("user", user);
            
            redirectAttributes.addFlashAttribute("success", "Password changed successfully");
            return "redirect:/profile";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to change password: " + e.getMessage());
            return "redirect:/change-password";
        }
    }
    
    @GetMapping("/profile/edit")
    public String showEditProfileForm(HttpSession session, Model model, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (user == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        model.addAttribute("user", user);
        
        // If user is a student, get student details
        if (user.getRole() == User.Role.STUDENT) {
            Optional<Student> studentOpt = studentService.getStudentByUser(user);
            if (studentOpt.isPresent()) {
                model.addAttribute("student", studentOpt.get());
            }
        }
        // If user is faculty, get faculty details
        else if (user.getRole() == User.Role.FACULTY) {
            Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(user);
            if (facultyOpt.isPresent()) {
                model.addAttribute("faculty", facultyOpt.get());
            }
        }
        
        return "profile/edit";
    }
    
    @PostMapping("/profile/edit")
    public String updateProfile(
            @ModelAttribute User updatedUser,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String facultyDepartment,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String officeHours,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        
        User sessionUser = (User) session.getAttribute("user");
        
        // Check if user is logged in
        if (sessionUser == null) {
            redirectAttributes.addFlashAttribute("error", "You must be logged in to access this page");
            return "redirect:/login";
        }
        
        try {
            // Update user details
            // Ensure that ID, username, and role cannot be changed
            updatedUser.setId(sessionUser.getId());
            updatedUser.setUsername(sessionUser.getUsername());
            updatedUser.setRole(sessionUser.getRole());
            updatedUser.setPassword(sessionUser.getPassword()); // Preserve the existing password
            
            // Validate email is not already used by another user
            Optional<User> userWithSameEmail = userService.getUserByEmail(updatedUser.getEmail());
            if (userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(updatedUser.getId())) {
                redirectAttributes.addFlashAttribute("error", "Email is already in use by another user");
                return "redirect:/profile/edit";
            }
            
            // Save updated user
            User savedUser = userService.saveUser(updatedUser);
            
            // Update role-specific details
            if (savedUser.getRole() == User.Role.STUDENT) {
                Optional<Student> studentOpt = studentService.getStudentByUser(savedUser);
                if (studentOpt.isPresent()) {
                    Student student = studentOpt.get();
                    
                    // Update student details
                    if (department != null && !department.trim().isEmpty()) {
                        student.setDepartment(department);
                    }
                    
                    if (semester != null && !semester.trim().isEmpty()) {
                        try {
                            student.setSemester(Integer.parseInt(semester));
                        } catch (NumberFormatException e) {
                            // Handle invalid semester input
                            // For now, we'll simply ignore it
                        }
                    }
                    
                    studentService.saveStudent(student);
                }
            } else if (savedUser.getRole() == User.Role.FACULTY) {
                Optional<Faculty> facultyOpt = facultyService.getFacultyByUser(savedUser);
                if (facultyOpt.isPresent()) {
                    Faculty faculty = facultyOpt.get();
                    
                    // Update faculty details
                    if (facultyDepartment != null && !facultyDepartment.trim().isEmpty()) {
                        faculty.setDepartment(facultyDepartment);
                    }
                    
                    if (designation != null && !designation.trim().isEmpty()) {
                        faculty.setDesignation(designation);
                    }
                    
                    if (officeHours != null && !officeHours.trim().isEmpty()) {
                        faculty.setOfficeHours(officeHours);
                    }
                    
                    facultyService.saveFaculty(faculty);
                }
            }
            
            // Update session with the updated user
            session.setAttribute("user", savedUser);
            
            redirectAttributes.addFlashAttribute("success", "Profile updated successfully");
            return "redirect:/profile";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to update profile: " + e.getMessage());
            return "redirect:/profile/edit";
        }
    }
} 