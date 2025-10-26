package com.edusync.edusync.repository;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse(Course course);
    List<Exam> findByExamDateAfter(LocalDateTime date);
    List<Exam> findByCourseAndExamDateAfter(Course course, LocalDateTime date);
} 