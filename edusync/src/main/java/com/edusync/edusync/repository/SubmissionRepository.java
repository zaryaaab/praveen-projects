package com.edusync.edusync.repository;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByStudent(Student student);
    List<Submission> findByAssignment(Assignment assignment);
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, Student student);
    List<Submission> findByAssignmentAndGraded(Assignment assignment, Boolean graded);
    int countByAssignment(Assignment assignment);
} 