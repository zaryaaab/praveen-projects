package com.edusync.edusync.repository;

import com.edusync.edusync.model.Announcement;
import com.edusync.edusync.model.Course;
import com.edusync.edusync.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByCourse(Course course);
    List<Announcement> findByFaculty(Faculty faculty);
    List<Announcement> findTop10ByOrderByPostDateDesc();
} 