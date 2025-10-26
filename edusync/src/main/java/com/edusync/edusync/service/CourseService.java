package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {
    
    private final CourseRepository courseRepository;
    
    @Autowired
    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }
    
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
    
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }
    
    public Optional<Course> getCourseByCourseCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode);
    }
    
    public List<Course> getCoursesByFaculty(Faculty faculty) {
        return courseRepository.findByFaculty(faculty);
    }
    
    @Transactional
    public Course saveCourse(Course course) {
        // Initialize the collections if null
        if (course.getStudents() == null) {
            course.setStudents(new HashSet<>());
        }
        if (course.getAssignments() == null) {
            course.setAssignments(new HashSet<>());
        }
        
        // Update faculty's courses collection if faculty is assigned
        if (course.getFaculty() != null) {
            Faculty faculty = course.getFaculty();
            if (faculty.getCourses() == null) {
                faculty.setCourses(new HashSet<>());
            }
            faculty.getCourses().add(course);
        }
        
        return courseRepository.save(course);
    }
    
    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
    
    public Set<Student> getEnrolledStudents(Course course) {
        Optional<Course> optionalCourse = courseRepository.findById(course.getId());
        return optionalCourse.map(Course::getStudents).orElse(null);
    }
    
    @Transactional
    public Course assignFaculty(Course course, Faculty faculty) {
        course.setFaculty(faculty);
        
        // Update faculty's courses collection
        if (faculty.getCourses() == null) {
            faculty.setCourses(new HashSet<>());
        }
        faculty.getCourses().add(course);
        
        return courseRepository.save(course);
    }
} 