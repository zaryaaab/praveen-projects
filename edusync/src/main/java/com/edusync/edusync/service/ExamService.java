package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Exam;
import com.edusync.edusync.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExamService {
    
    private final ExamRepository examRepository;
    
    @Autowired
    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }
    
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }
    
    public List<Exam> getExamsByCourse(Course course) {
        return examRepository.findByCourse(course);
    }
    
    public List<Exam> getUpcomingExams() {
        return examRepository.findByExamDateAfter(LocalDateTime.now());
    }
    
    public List<Exam> getUpcomingExamsByCourse(Course course) {
        return examRepository.findByCourseAndExamDateAfter(course, LocalDateTime.now());
    }
    
    public Exam saveExam(Exam exam) {
        return examRepository.save(exam);
    }
    
    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }
} 