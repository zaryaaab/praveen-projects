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
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Service
public class DataInitializerService {
    
    private final CourseScheduleRepository courseScheduleRepository;
    private final StudentService studentService;
    private final CourseService courseService;
    
    @Autowired
    public DataInitializerService(CourseScheduleRepository courseScheduleRepository, 
                                 StudentService studentService, 
                                 CourseService courseService) {
        this.courseScheduleRepository = courseScheduleRepository;
        this.studentService = studentService;
        this.courseService = courseService;
    }
    
    /**
     * Initialize sample course schedule data for given student
     */
    @Transactional
    public void initializeScheduleData(Student student) {
        if (student == null || student.getCourses() == null || student.getCourses().isEmpty()) {
            return;
        }
        
        // Check if this student already has schedule data
        List<Course> courses = new ArrayList<>(student.getCourses());
        List<CourseSchedule> existingSchedules = courseScheduleRepository.findByCourseIn(courses);
        
        if (!existingSchedules.isEmpty()) {
            // Schedules already exist, no need to create more
            return;
        }
        
        // Create schedules for each course
        for (Course course : student.getCourses()) {
            createRandomSchedulesForCourse(course);
        }
    }
    
    /**
     * Create random schedule entries for a course
     */
    private void createRandomSchedulesForCourse(Course course) {
        Random random = new Random();
        
        // Class days (typically 2-3 days per week)
        int classDaysCount = random.nextInt(2) + 2; // 2 or 3 days
        List<DayOfWeek> selectedDays = getRandomDays(classDaysCount, random);
        
        // Create a lecture for each selected day
        for (DayOfWeek day : selectedDays) {
            // Generate a random start time between 8:00 and 17:00
            int hour = random.nextInt(8) + 8; // 8-16 (8am to 4pm)
            int minute = random.nextInt(2) * 30; // 0 or 30 minutes
            
            LocalTime startTime = LocalTime.of(hour, minute);
            LocalTime endTime = startTime.plusMinutes(90); // 90-minute classes
            
            String location = "Room " + (random.nextInt(5) + 101); // Rooms 101-105
            
            CourseSchedule.ScheduleType type = CourseSchedule.ScheduleType.LECTURE;
            
            // Create schedule entry
            CourseSchedule schedule = new CourseSchedule();
            schedule.setCourse(course);
            schedule.setDayOfWeek(day);
            schedule.setStartTime(startTime);
            schedule.setEndTime(endTime);
            schedule.setLocation(location);
            schedule.setType(type);
            
            courseScheduleRepository.save(schedule);
        }
        
        // Add a lab/tutorial session with 25% probability
        if (random.nextDouble() < 0.25) {
            // Pick a day not already used
            List<DayOfWeek> remainingDays = new ArrayList<>();
            for (DayOfWeek day : DayOfWeek.values()) {
                if (!selectedDays.contains(day) && day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                    remainingDays.add(day);
                }
            }
            
            if (!remainingDays.isEmpty()) {
                DayOfWeek labDay = remainingDays.get(random.nextInt(remainingDays.size()));
                
                // Generate a random start time between 13:00 and 17:00 for lab
                int hour = random.nextInt(4) + 13; // 13-17 (1pm to 5pm)
                int minute = random.nextInt(2) * 30; // 0 or 30 minutes
                
                LocalTime startTime = LocalTime.of(hour, minute);
                LocalTime endTime = startTime.plusMinutes(120); // 120-minute lab sessions
                
                String location = "Lab " + (random.nextInt(3) + 201); // Labs 201-203
                
                CourseSchedule.ScheduleType type = random.nextBoolean() ? 
                    CourseSchedule.ScheduleType.LAB : CourseSchedule.ScheduleType.TUTORIAL;
                
                // Create schedule entry
                CourseSchedule schedule = new CourseSchedule();
                schedule.setCourse(course);
                schedule.setDayOfWeek(labDay);
                schedule.setStartTime(startTime);
                schedule.setEndTime(endTime);
                schedule.setLocation(location);
                schedule.setType(type);
                
                courseScheduleRepository.save(schedule);
            }
        }
    }
    
    /**
     * Get a list of random weekdays (Mon-Fri)
     */
    private List<DayOfWeek> getRandomDays(int count, Random random) {
        List<DayOfWeek> weekdays = List.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY
        );
        
        List<DayOfWeek> shuffled = new ArrayList<>(weekdays);
        
        // Simple shuffle algorithm for small list
        for (int i = 0; i < shuffled.size(); i++) {
            int swapIndex = random.nextInt(shuffled.size());
            DayOfWeek temp = shuffled.get(i);
            shuffled.set(i, shuffled.get(swapIndex));
            shuffled.set(swapIndex, temp);
        }
        
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }
    
    /**
     * Initialize sample data for all students
     */
    @Transactional
    public void initializeAllStudentSchedules() {
        List<Student> allStudents = studentService.getAllStudents();
        for (Student student : allStudents) {
            initializeScheduleData(student);
        }
    }
} 