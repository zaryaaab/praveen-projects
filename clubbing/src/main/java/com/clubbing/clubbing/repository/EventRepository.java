package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.Event;
import com.clubbing.clubbing.model.EventStatus;
import com.clubbing.clubbing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Find events by club
    List<Event> findByClub(Club club);
    
    // Find events by club and status
    List<Event> findByClubAndStatus(Club club, EventStatus status);
    
    // Find events by status
    List<Event> findByStatus(EventStatus status);
    
    // Find events by creator
    List<Event> findByCreatedBy(User creator);
    
    // Find published events
    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' ORDER BY e.eventDate ASC")
    List<Event> findPublishedEvents();
    
    // Find upcoming published events
    @Query("SELECT e FROM Event e WHERE e.status = 'PUBLISHED' AND e.eventDate > :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingPublishedEvents(@Param("now") LocalDateTime now);
    
    // Find past events
    @Query("SELECT e FROM Event e WHERE e.eventDate < :now ORDER BY e.eventDate DESC")
    List<Event> findPastEvents(@Param("now") LocalDateTime now);
    
    // Find events by club admin
    @Query("SELECT e FROM Event e WHERE e.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "ORDER BY e.eventDate DESC")
    List<Event> findByClubAdmin(@Param("admin") User admin);
    
    // Find upcoming events by club admin
    @Query("SELECT e FROM Event e WHERE e.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "AND e.eventDate > :now ORDER BY e.eventDate ASC")
    List<Event> findUpcomingByClubAdmin(@Param("admin") User admin, @Param("now") LocalDateTime now);
    
    // Search events by title or description
    @Query("SELECT e FROM Event e WHERE " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.club.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND e.status = 'PUBLISHED' ORDER BY e.eventDate ASC")
    List<Event> searchPublishedEvents(@Param("searchTerm") String searchTerm);
    
    // Find events by date range
    @Query("SELECT e FROM Event e WHERE e.eventDate BETWEEN :startDate AND :endDate " +
           "AND e.status = 'PUBLISHED' ORDER BY e.eventDate ASC")
    List<Event> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                               @Param("endDate") LocalDateTime endDate);
    
    // Find events by location
    @Query("SELECT e FROM Event e WHERE LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%')) " +
           "AND e.status = 'PUBLISHED' ORDER BY e.eventDate ASC")
    List<Event> findByLocation(@Param("location") String location);
    
    // Count events by club
    long countByClub(Club club);
    
    // Count events by club and status
    long countByClubAndStatus(Club club, EventStatus status);
    
    // Count upcoming events by club
    @Query("SELECT COUNT(e) FROM Event e WHERE e.club = :club AND e.eventDate > :now")
    long countUpcomingByClub(@Param("club") Club club, @Param("now") LocalDateTime now);
    
    // Find events with registrations ending soon
    @Query("SELECT e FROM Event e WHERE e.registrationDeadline BETWEEN :now AND :deadline " +
           "AND e.status = 'PUBLISHED' ORDER BY e.registrationDeadline ASC")
    List<Event> findEventsWithRegistrationEndingSoon(@Param("now") LocalDateTime now, 
                                                     @Param("deadline") LocalDateTime deadline);
    
    // Find events starting soon
    @Query("SELECT e FROM Event e WHERE e.eventDate BETWEEN :now AND :startTime " +
           "AND e.status = 'PUBLISHED' ORDER BY e.eventDate ASC")
    List<Event> findEventsStartingSoon(@Param("now") LocalDateTime now, 
                                      @Param("startTime") LocalDateTime startTime);
    
    // Check if event title exists for a club
    boolean existsByClubAndTitleIgnoreCase(Club club, String title);
    
    // Find events that need to be marked as completed
    @Query("SELECT e FROM Event e WHERE e.eventDate < :cutoffTime AND e.status = 'PUBLISHED'")
    List<Event> findEventsToMarkCompleted(@Param("cutoffTime") LocalDateTime cutoffTime);
} 