package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Grade;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.repository.GradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GradeService {
    
    private final GradeRepository gradeRepository;
    
    @Autowired
    public GradeService(GradeRepository gradeRepository) {
        this.gradeRepository = gradeRepository;
    }
    
    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }
    
    public Optional<Grade> getGradeById(Long id) {
        return gradeRepository.findById(id);
    }
    
    public List<Grade> getGradesByStudent(Student student) {
        return gradeRepository.findByStudent(student);
    }
    
    public List<Grade> getGradesByCourse(Course course) {
        return gradeRepository.findByCourse(course);
    }
    
    public Optional<Grade> getGradeByStudentAndCourse(Student student, Course course) {
        return gradeRepository.findByStudentAndCourse(student, course);
    }
    
    public List<Grade> getGradesByStudentAndSemester(Student student, String semester) {
        return gradeRepository.findByStudentAndSemester(student, semester);
    }
    
    public Grade saveGrade(Grade grade) {
        return gradeRepository.save(grade);
    }
    
    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
    }
    
    public String calculateLetterGrade(Double totalMarks) {
        if (totalMarks >= 90) {
            return "A";
        } else if (totalMarks >= 80) {
            return "B";
        } else if (totalMarks >= 70) {
            return "C";
        } else if (totalMarks >= 60) {
            return "D";
        } else {
            return "F";
        }
    }
    
    public Double calculateGPA(List<Grade> grades) {
        if (grades == null || grades.isEmpty()) {
            return 0.0;
        }
        
        double totalPoints = 0.0;
        int totalCourses = grades.size();
        
        for (Grade grade : grades) {
            String letterGrade = grade.getLetterGrade();
            switch (letterGrade) {
                case "A":
                    totalPoints += 4.0;
                    break;
                case "B":
                    totalPoints += 3.0;
                    break;
                case "C":
                    totalPoints += 2.0;
                    break;
                case "D":
                    totalPoints += 1.0;
                    break;
                default:
                    totalPoints += 0.0;
            }
        }
        
        return totalPoints / totalCourses;
    }
} 