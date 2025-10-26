package com.edusync.edusync.repository;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourse(Course course);
    List<Assignment> findByDueDateAfter(LocalDate date);
    List<Assignment> findByCourseAndDueDateAfter(Course course, LocalDate date);
} 