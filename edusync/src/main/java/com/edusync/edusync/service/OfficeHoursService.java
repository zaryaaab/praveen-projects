package com.edusync.edusync.service;

import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.OfficeHours;
import com.edusync.edusync.repository.OfficeHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class OfficeHoursService {
    
    private final OfficeHoursRepository officeHoursRepository;
    
    @Autowired
    public OfficeHoursService(OfficeHoursRepository officeHoursRepository) {
        this.officeHoursRepository = officeHoursRepository;
    }
    
    // Get all office hours for a faculty
    public List<OfficeHours> getOfficeHoursForFaculty(Faculty faculty) {
        return officeHoursRepository.findByFacultyOrderByDayOfWeekAscStartTimeAsc(faculty);
    }
    
    // Get all office hours for a faculty by ID
    public List<OfficeHours> getOfficeHoursForFacultyId(Long facultyId) {
        return officeHoursRepository.findByFacultyIdOrderByDayOfWeekAscStartTimeAsc(facultyId);
    }
    
    // Get a specific office hour by ID
    public Optional<OfficeHours> getOfficeHoursById(Long id) {
        return officeHoursRepository.findById(id);
    }
    
    // Add a new office hour
    public OfficeHours addOfficeHours(Faculty faculty, DayOfWeek dayOfWeek, 
                                     LocalTime startTime, LocalTime endTime, 
                                     String location, String notes) {
        OfficeHours officeHours = new OfficeHours();
        officeHours.setFaculty(faculty);
        officeHours.setDayOfWeek(dayOfWeek);
        officeHours.setStartTime(startTime);
        officeHours.setEndTime(endTime);
        officeHours.setLocation(location);
        officeHours.setNotes(notes);
        
        return officeHoursRepository.save(officeHours);
    }
    
    // Save an office hour
    public OfficeHours saveOfficeHours(OfficeHours officeHours) {
        return officeHoursRepository.save(officeHours);
    }
    
    // Delete an office hour
    public void deleteOfficeHours(Long id) {
        officeHoursRepository.deleteById(id);
    }
    
    // Delete all office hours for a faculty
    @Transactional
    public void deleteAllOfficeHoursForFaculty(Faculty faculty) {
        officeHoursRepository.deleteByFaculty(faculty);
    }
} 