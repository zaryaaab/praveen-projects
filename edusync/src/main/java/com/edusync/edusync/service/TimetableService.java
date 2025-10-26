package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.CourseSchedule;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.repository.CourseScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TimetableService {
    
    private final CourseScheduleRepository courseScheduleRepository;
    
    @Autowired
    public TimetableService(CourseScheduleRepository courseScheduleRepository) {
        this.courseScheduleRepository = courseScheduleRepository;
    }
    
    /**
     * Get all schedules for a given course
     */
    public List<CourseSchedule> getSchedulesByCourse(Course course) {
        return courseScheduleRepository.findByCourse(course);
    }
    
    /**
     * Get all schedules for a student based on enrolled courses
     */
    public List<CourseSchedule> getSchedulesForStudent(Student student) {
        if (student == null || student.getCourses() == null || student.getCourses().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Course> courses = new ArrayList<>(student.getCourses());
        return courseScheduleRepository.findByCourseIn(courses);
    }
    
    /**
     * Get student's schedules for a specific day of the week
     */
    public List<CourseSchedule> getSchedulesForStudentByDay(Student student, DayOfWeek dayOfWeek) {
        if (student == null || student.getCourses() == null || student.getCourses().isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Course> courses = new ArrayList<>(student.getCourses());
        return courseScheduleRepository.findByCourseInAndDayOfWeek(courses, dayOfWeek);
    }
    
    /**
     * Create and save a new course schedule
     */
    @Transactional
    public CourseSchedule createSchedule(Course course, DayOfWeek dayOfWeek, 
                                        LocalTime startTime, LocalTime endTime, 
                                        String location, CourseSchedule.ScheduleType type) {
        
        CourseSchedule schedule = new CourseSchedule();
        schedule.setCourse(course);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setLocation(location);
        schedule.setType(type);
        
        return courseScheduleRepository.save(schedule);
    }
    
    /**
     * Delete a course schedule
     */
    @Transactional
    public void deleteSchedule(Long scheduleId) {
        courseScheduleRepository.deleteById(scheduleId);
    }
    
    /**
     * Organize schedules by day of week for timetable display
     * Returns a map with DayOfWeek as key and a list of schedules as value
     */
    public Map<DayOfWeek, List<CourseSchedule>> organizeSchedulesByDay(List<CourseSchedule> schedules) {
        Map<DayOfWeek, List<CourseSchedule>> schedulesByDay = new EnumMap<>(DayOfWeek.class);
        
        // Initialize empty lists for each day
        for (DayOfWeek day : DayOfWeek.values()) {
            schedulesByDay.put(day, new ArrayList<>());
        }
        
        // Group schedules by day
        for (CourseSchedule schedule : schedules) {
            schedulesByDay.get(schedule.getDayOfWeek()).add(schedule);
        }
        
        // Sort schedules by start time in each day
        for (DayOfWeek day : schedulesByDay.keySet()) {
            schedulesByDay.get(day).sort(Comparator.comparing(CourseSchedule::getStartTime));
        }
        
        return schedulesByDay;
    }
    
    /**
     * Check if there are any schedule conflicts
     * Returns a list of conflicting schedules
     */
    public List<CourseSchedule> findScheduleConflicts(List<CourseSchedule> schedules) {
        List<CourseSchedule> conflicts = new ArrayList<>();
        
        // Group schedules by day
        Map<DayOfWeek, List<CourseSchedule>> schedulesByDay = organizeSchedulesByDay(schedules);
        
        // For each day, check for time overlaps
        for (DayOfWeek day : schedulesByDay.keySet()) {
            List<CourseSchedule> daySchedules = schedulesByDay.get(day);
            
            for (int i = 0; i < daySchedules.size(); i++) {
                CourseSchedule s1 = daySchedules.get(i);
                
                for (int j = i + 1; j < daySchedules.size(); j++) {
                    CourseSchedule s2 = daySchedules.get(j);
                    
                    // Check if schedules overlap
                    if ((s1.getStartTime().isBefore(s2.getEndTime()) || s1.getStartTime().equals(s2.getEndTime())) && 
                        (s1.getEndTime().isAfter(s2.getStartTime()) || s1.getEndTime().equals(s2.getStartTime()))) {
                        
                        if (!conflicts.contains(s1)) conflicts.add(s1);
                        if (!conflicts.contains(s2)) conflicts.add(s2);
                    }
                }
            }
        }
        
        return conflicts;
    }
} 