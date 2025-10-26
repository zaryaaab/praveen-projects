package com.edusync.edusync.service;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {
    
    private final AssignmentRepository assignmentRepository;
    
    @Autowired
    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }
    
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }
    
    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepository.findById(id);
    }
    
    public List<Assignment> getAssignmentsByCourse(Course course) {
        return assignmentRepository.findByCourse(course);
    }
    
    public List<Assignment> getUpcomingAssignments() {
        return assignmentRepository.findByDueDateAfter(LocalDate.now());
    }
    
    public List<Assignment> getUpcomingAssignmentsByCourse(Course course) {
        return assignmentRepository.findByCourseAndDueDateAfter(course, LocalDate.now());
    }
    
    public Assignment saveAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }
    
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
} 