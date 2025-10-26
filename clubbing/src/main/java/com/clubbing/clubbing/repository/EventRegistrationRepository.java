package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.Event;
import com.clubbing.clubbing.model.EventRegistration;
import com.clubbing.clubbing.model.RegistrationStatus;
import com.clubbing.clubbing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    
    // Find registration by user and event
    Optional<EventRegistration> findByUserAndEvent(User user, Event event);
    
    // Find all registrations for an event
    List<EventRegistration> findByEvent(Event event);
    
    // Find all registrations for a user
    List<EventRegistration> findByUser(User user);
    
    // Find registrations by status
    List<EventRegistration> findByStatus(RegistrationStatus status);
    
    // Find registrations by event and status
    List<EventRegistration> findByEventAndStatus(Event event, RegistrationStatus status);
    
    // Find active registrations for an event
    @Query("SELECT er FROM EventRegistration er WHERE er.event = :event " +
           "AND er.status IN ('REGISTERED', 'ATTENDED') ORDER BY er.registrationDate ASC")
    List<EventRegistration> findActiveByEvent(@Param("event") Event event);
    
    // Find active registrations for a user
    @Query("SELECT er FROM EventRegistration er WHERE er.user = :user " +
           "AND er.status IN ('REGISTERED', 'WAITLISTED') ORDER BY er.event.eventDate ASC")
    List<EventRegistration> findActiveByUser(@Param("user") User user);
    
    // Find upcoming registrations for a user
    @Query("SELECT er FROM EventRegistration er WHERE er.user = :user " +
           "AND er.status IN ('REGISTERED', 'WAITLISTED') " +
           "AND er.event.eventDate > :now ORDER BY er.event.eventDate ASC")
    List<EventRegistration> findUpcomingByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    // Find past registrations for a user
    @Query("SELECT er FROM EventRegistration er WHERE er.user = :user " +
           "AND er.event.eventDate < :now ORDER BY er.event.eventDate DESC")
    List<EventRegistration> findPastByUser(@Param("user") User user, @Param("now") LocalDateTime now);
    
    // Find waitlisted registrations for an event
    @Query("SELECT er FROM EventRegistration er WHERE er.event = :event " +
           "AND er.status = 'WAITLISTED' ORDER BY er.registrationDate ASC")
    List<EventRegistration> findWaitlistedByEvent(@Param("event") Event event);
    
    // Count active registrations for an event
    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event = :event " +
           "AND er.status = 'REGISTERED'")
    long countActiveByEvent(@Param("event") Event event);
    
    // Count waitlisted registrations for an event
    @Query("SELECT COUNT(er) FROM EventRegistration er WHERE er.event = :event " +
           "AND er.status = 'WAITLISTED'")
    long countWaitlistedByEvent(@Param("event") Event event);
    
    // Count total registrations for an event (including cancelled)
    long countByEvent(Event event);
    
    // Count registrations by user
    long countByUser(User user);
    
    // Check if user is registered for event
    @Query("SELECT COUNT(er) > 0 FROM EventRegistration er WHERE er.user = :user " +
           "AND er.event = :event AND er.status IN ('REGISTERED', 'WAITLISTED')")
    boolean existsByUserAndEventAndActiveStatus(@Param("user") User user, @Param("event") Event event);
    
    // Find registrations for events managed by club admin
    @Query("SELECT er FROM EventRegistration er WHERE er.event.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "ORDER BY er.registrationDate DESC")
    List<EventRegistration> findByClubAdmin(@Param("admin") User admin);
    
    // Find recent registrations for events managed by club admin
    @Query("SELECT er FROM EventRegistration er WHERE er.event.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) " +
           "AND er.registrationDate > :since ORDER BY er.registrationDate DESC")
    List<EventRegistration> findRecentByClubAdmin(@Param("admin") User admin, @Param("since") LocalDateTime since);
    
    // Find registrations that need reminder notifications
    @Query("SELECT er FROM EventRegistration er WHERE er.status = 'REGISTERED' " +
           "AND er.event.eventDate BETWEEN :startTime AND :endTime")
    List<EventRegistration> findRegistrationsForReminder(@Param("startTime") LocalDateTime startTime,
                                                         @Param("endTime") LocalDateTime endTime);
    
    // Delete registrations by event (for cleanup)
    void deleteByEvent(Event event);
    
    // Delete registrations by user (for user deletion)
    void deleteByUser(User user);
} 