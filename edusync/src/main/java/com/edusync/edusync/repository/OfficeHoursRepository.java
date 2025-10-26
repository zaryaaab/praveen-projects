package com.edusync.edusync.repository;

import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.OfficeHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfficeHoursRepository extends JpaRepository<OfficeHours, Long> {
    
    // Find all office hours for a specific faculty
    List<OfficeHours> findByFacultyOrderByDayOfWeekAscStartTimeAsc(Faculty faculty);
    
    // Find all office hours for faculty with a specific ID
    List<OfficeHours> findByFacultyIdOrderByDayOfWeekAscStartTimeAsc(Long facultyId);
    
    // Delete all office hours for a faculty
    void deleteByFaculty(Faculty faculty);
} 