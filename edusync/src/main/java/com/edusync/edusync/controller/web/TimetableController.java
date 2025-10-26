package com.edusync.edusync.controller.web;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.CourseSchedule;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import com.edusync.edusync.service.CourseService;
import com.edusync.edusync.service.DataInitializerService;
import com.edusync.edusync.service.StudentService;
import com.edusync.edusync.service.TimetableService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@Controller
public class TimetableController {
    
    private final TimetableService timetableService;
    private final StudentService studentService;
    private final CourseService courseService;
    private final DataInitializerService dataInitializerService;
    
    @Autowired
    public TimetableController(TimetableService timetableService, StudentService studentService, CourseService courseService, DataInitializerService dataInitializerService) {
        this.timetableService = timetableService;
        this.studentService = studentService;
        this.courseService = courseService;
        this.dataInitializerService = dataInitializerService;
    }
    
    /**
     * Display the student's timetable
     */
    @GetMapping("/student/timetable")
    public String studentTimetable(
            HttpSession session, 
            Model model, 
            RedirectAttributes redirectAttributes,
            @RequestParam(required = false) String view) {
        
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
        
        // Initialize timetable data for the student if needed
        dataInitializerService.initializeScheduleData(student);
        
        // Get all schedules for the student
        List<CourseSchedule> allSchedules = timetableService.getSchedulesForStudent(student);
        model.addAttribute("allSchedules", allSchedules);
        
        // Organize schedules by day of week
        Map<DayOfWeek, List<CourseSchedule>> schedulesByDay = timetableService.organizeSchedulesByDay(allSchedules);
        model.addAttribute("schedulesByDay", schedulesByDay);
        
        // Find any schedule conflicts
        List<CourseSchedule> conflicts = timetableService.findScheduleConflicts(allSchedules);
        model.addAttribute("conflicts", conflicts);
        
        // Set view type (weekly or daily)
        String viewType = (view != null && view.equals("daily")) ? "daily" : "weekly";
        model.addAttribute("viewType", viewType);
        
        // Add current day of week to model to avoid calculating it in template
        DayOfWeek currentDayOfWeek = java.time.LocalDate.now().getDayOfWeek();
        model.addAttribute("currentDayOfWeek", currentDayOfWeek);
        model.addAttribute("currentDayOfWeekName", currentDayOfWeek.name());
        
        // Add a map of day name strings to DayOfWeek enums to avoid using T() in the template
        Map<String, DayOfWeek> dayOfWeekMap = new HashMap<>();
        dayOfWeekMap.put("MONDAY", DayOfWeek.MONDAY);
        dayOfWeekMap.put("TUESDAY", DayOfWeek.TUESDAY);
        dayOfWeekMap.put("WEDNESDAY", DayOfWeek.WEDNESDAY);
        dayOfWeekMap.put("THURSDAY", DayOfWeek.THURSDAY);
        dayOfWeekMap.put("FRIDAY", DayOfWeek.FRIDAY);
        dayOfWeekMap.put("SATURDAY", DayOfWeek.SATURDAY);
        dayOfWeekMap.put("SUNDAY", DayOfWeek.SUNDAY);
        model.addAttribute("dayOfWeekMap", dayOfWeekMap);
        
        return "student/timetable";
    }
} 