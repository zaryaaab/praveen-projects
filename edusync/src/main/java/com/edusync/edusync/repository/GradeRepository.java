package com.edusync.edusync.repository;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Grade;
import com.edusync.edusync.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByStudent(Student student);
    List<Grade> findByCourse(Course course);
    Optional<Grade> findByStudentAndCourse(Student student, Course course);
    List<Grade> findByStudentAndSemester(Student student, String semester);
} 