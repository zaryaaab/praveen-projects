package com.edusync.edusync.service;

import com.edusync.edusync.model.Announcement;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementService {
    
    private final AnnouncementRepository announcementRepository;
    
    @Autowired
    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }
    
    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }
    
    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }
    
    public List<Announcement> getAnnouncementsByCourse(Course course) {
        return announcementRepository.findByCourse(course);
    }
    
    public List<Announcement> getAnnouncementsByFaculty(Faculty faculty) {
        return announcementRepository.findByFaculty(faculty);
    }
    
    public List<Announcement> getRecentAnnouncements() {
        return announcementRepository.findTop10ByOrderByPostDateDesc();
    }
    
    public Announcement createAnnouncement(String title, String content, Faculty faculty, Course course) {
        Announcement announcement = new Announcement();
        announcement.setTitle(title);
        announcement.setContent(content);
        announcement.setFaculty(faculty);
        announcement.setCourse(course);
        announcement.setPostDate(LocalDateTime.now());
        return announcementRepository.save(announcement);
    }
    
    public Announcement saveAnnouncement(Announcement announcement) {
        return announcementRepository.save(announcement);
    }
    
    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
} 