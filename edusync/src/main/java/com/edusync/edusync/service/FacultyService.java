package com.edusync.edusync.service;

import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.User;
import com.edusync.edusync.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class FacultyService {
    
    private final FacultyRepository facultyRepository;
    
    @Autowired
    public FacultyService(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }
    
    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }
    
    public Optional<Faculty> getFacultyById(Long id) {
        return facultyRepository.findById(id);
    }
    
    public Optional<Faculty> getFacultyByUser(User user) {
        return facultyRepository.findByUser(user);
    }
    
    public Optional<Faculty> getFacultyByFacultyId(String facultyId) {
        return facultyRepository.findByFacultyId(facultyId);
    }
    
    @Transactional
    public Faculty saveFaculty(Faculty faculty) {
        // Initialize courses collection if null
        if (faculty.getCourses() == null) {
            faculty.setCourses(new HashSet<>());
        }
        return facultyRepository.save(faculty);
    }
    
    @Transactional
    public void deleteFaculty(Long id) {
        facultyRepository.deleteById(id);
    }
    
    public Set<Course> getAssignedCourses(Faculty faculty) {
        Optional<Faculty> optionalFaculty = facultyRepository.findById(faculty.getId());
        return optionalFaculty.map(Faculty::getCourses).orElse(null);
    }
} 