package com.edusync.edusync.service;

import com.edusync.edusync.model.Assignment;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.Submission;
import com.edusync.edusync.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {
    
    private final SubmissionRepository submissionRepository;
    
    @Autowired
    public SubmissionService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }
    
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }
    
    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepository.findById(id);
    }
    
    public List<Submission> getSubmissionsByStudent(Student student) {
        return submissionRepository.findByStudent(student);
    }
    
    public List<Submission> getSubmissionsByAssignment(Assignment assignment) {
        return submissionRepository.findByAssignment(assignment);
    }
    
    public Optional<Submission> getSubmissionByAssignmentAndStudent(Assignment assignment, Student student) {
        return submissionRepository.findByAssignmentAndStudent(assignment, student);
    }
    
    public List<Submission> getUngradedSubmissionsByAssignment(Assignment assignment) {
        return submissionRepository.findByAssignmentAndGraded(assignment, false);
    }
    
    public Submission saveSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }
    
    public Submission gradeSubmission(Submission submission, Integer marks, String feedback) {
        submission.setObtainedMarks(marks);
        submission.setFeedback(feedback);
        submission.setGraded(true);
        return submissionRepository.save(submission);
    }
    
    public void deleteSubmission(Long id) {
        submissionRepository.deleteById(id);
    }
    
    public int getSubmissionCountByAssignment(Assignment assignment) {
        return submissionRepository.countByAssignment(assignment);
    }
} 