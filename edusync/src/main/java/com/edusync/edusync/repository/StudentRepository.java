package com.edusync.edusync.repository;

import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByStudentId(String studentId);
} 