package com.edusync.edusync.repository;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByFaculty(Faculty faculty);
} 