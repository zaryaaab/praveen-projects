package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Student;
import com.edusync.edusync.model.User;
import com.edusync.edusync.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class StudentService {
    
    private final StudentRepository studentRepository;
    
    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }
    
    public Optional<Student> getStudentByUser(User user) {
        return studentRepository.findByUser(user);
    }
    
    public Optional<Student> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }
    
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }
    
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
    
    public Set<Course> getEnrolledCourses(Student student) {
        Optional<Student> optionalStudent = studentRepository.findById(student.getId());
        return optionalStudent.map(Student::getCourses).orElse(null);
    }
    
    public Student enrollCourse(Student student, Course course) {
        // Initialize the courses collection if it's null
        if (student.getCourses() == null) {
            student.setCourses(new HashSet<>());
        }
        student.getCourses().add(course);
        
        // Initialize the students collection on the course if it's null
        if (course.getStudents() == null) {
            course.setStudents(new HashSet<>());
        }
        course.getStudents().add(student);
        
        return studentRepository.save(student);
    }
    
    public Student unenrollCourse(Student student, Course course) {
        if (student.getCourses() != null) {
            student.getCourses().remove(course);
        }
        if (course.getStudents() != null) {
            course.getStudents().remove(student);
        }
        return studentRepository.save(student);
    }
} 