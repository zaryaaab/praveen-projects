package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.Event;
import com.clubbing.clubbing.model.EventAttendance;
import com.clubbing.clubbing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventAttendanceRepository extends JpaRepository<EventAttendance, Long> {
    
    // Find attendance by user and event
    Optional<EventAttendance> findByUserAndEvent(User user, Event event);
    
    // Find all attendance records for an event
    List<EventAttendance> findByEvent(Event event);
    
    // Find all attendance records for a user
    List<EventAttendance> findByUser(User user);
    
    // Find attended records for an event
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.event = :event AND ea.attended = true " +
           "ORDER BY ea.checkInTime ASC")
    List<EventAttendance> findAttendedByEvent(@Param("event") Event event);
    
    // Find not attended records for an event
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.event = :event AND ea.attended = false")
    List<EventAttendance> findNotAttendedByEvent(@Param("event") Event event);
    
    // Find attendance records for a user (attended events)
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.user = :user AND ea.attended = true " +
           "ORDER BY ea.event.eventDate DESC")
    List<EventAttendance> findAttendedByUser(@Param("user") User user);
    
    // Count attended for an event
    @Query("SELECT COUNT(ea) FROM EventAttendance ea WHERE ea.event = :event AND ea.attended = true")
    long countAttendedByEvent(@Param("event") Event event);
    
    // Count not attended for an event
    @Query("SELECT COUNT(ea) FROM EventAttendance ea WHERE ea.event = :event AND ea.attended = false")
    long countNotAttendedByEvent(@Param("event") Event event);
    
    // Count total attendance records for an event
    long countByEvent(Event event);
    
    // Count attended events for a user
    @Query("SELECT COUNT(ea) FROM EventAttendance ea WHERE ea.user = :user AND ea.attended = true")
    long countAttendedByUser(@Param("user") User user);
    
    // Check if user has attendance record for event
    boolean existsByUserAndEvent(User user, Event event);
    
    // Find attendance records for events managed by club admin
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.event.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "ORDER BY ea.event.eventDate DESC")
    List<EventAttendance> findByClubAdmin(@Param("admin") User admin);
    
    // Find recent attendance records for events managed by club admin
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.event.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "AND ea.checkInTime > :since ORDER BY ea.checkInTime DESC")
    List<EventAttendance> findRecentByClubAdmin(@Param("admin") User admin, @Param("since") LocalDateTime since);
    
    // Find attendance records by date range
    @Query("SELECT ea FROM EventAttendance ea WHERE ea.event.eventDate BETWEEN :startDate AND :endDate " +
           "ORDER BY ea.event.eventDate ASC")
    List<EventAttendance> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
    
    // Find attendance records marked by specific user
    List<EventAttendance> findByMarkedBy(User markedBy);
    
    // Get attendance statistics for a club
    @Query("SELECT COUNT(ea), " +
           "SUM(CASE WHEN ea.attended = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN ea.attended = false THEN 1 ELSE 0 END) " +
           "FROM EventAttendance ea WHERE ea.event.club = :club")
    Object[] getAttendanceStatsByClub(@Param("club") Club club);
    
    // Delete attendance records by event (for cleanup)
    void deleteByEvent(Event event);
    
    // Delete attendance records by user (for user deletion)
    void deleteByUser(User user);
} 