package com.edusync.edusync.repository;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, Long> {
    
    List<CourseSchedule> findByCourse(Course course);
    
    List<CourseSchedule> findByDayOfWeek(DayOfWeek dayOfWeek);
    
    List<CourseSchedule> findByCourseIn(List<Course> courses);
    
    List<CourseSchedule> findByCourseInAndDayOfWeek(List<Course> courses, DayOfWeek dayOfWeek);
} 