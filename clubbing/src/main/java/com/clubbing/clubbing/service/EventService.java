package com.clubbing.clubbing.service;

import com.clubbing.clubbing.dto.EventCreationDto;
import com.clubbing.clubbing.dto.EventDto;
import com.clubbing.clubbing.dto.EventUpdateDto;
import com.clubbing.clubbing.model.*;
import com.clubbing.clubbing.repository.ClubRepository;
import com.clubbing.clubbing.repository.EventRepository;
import com.clubbing.clubbing.repository.EventRegistrationRepository;
import com.clubbing.clubbing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventService {
    
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    
    /**
     * Create a new event
     */
    public EventDto createEvent(EventCreationDto eventCreationDto, String currentUserEmail) {
        log.info("Creating event: {} for club: {}", eventCreationDto.getTitle(), eventCreationDto.getClubId());
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Club club = clubRepository.findById(eventCreationDto.getClubId())
            .orElseThrow(() -> new RuntimeException("Club not found"));
        
        // Check if user is admin of the club
        if (!club.getAdmins().contains(currentUser)) {
            throw new AccessDeniedException("You are not authorized to create events for this club");
        }
        
        // Check for duplicate event title in the same club
        if (eventRepository.existsByClubAndTitleIgnoreCase(club, eventCreationDto.getTitle())) {
            throw new RuntimeException("An event with this title already exists for this club");
        }
        
        Event event = Event.builder()
            .title(eventCreationDto.getTitle())
            .description(eventCreationDto.getDescription())
            .club(club)
            .eventDate(eventCreationDto.getEventDate())
            .location(eventCreationDto.getLocation())
            .capacity(eventCreationDto.getCapacity())
            .registrationDeadline(eventCreationDto.getRegistrationDeadline())
            .imageUrl(eventCreationDto.getImageUrl())
            .createdBy(currentUser)
            .status(eventCreationDto.isPublishImmediately() ? EventStatus.PUBLISHED : EventStatus.DRAFT)
            .build();
        
        Event savedEvent = eventRepository.save(event);
        log.info("Event created successfully with ID: {}", savedEvent.getId());
        
        return convertToDto(savedEvent);
    }
    
    /**
     * Update an existing event
     */
    public EventDto updateEvent(EventUpdateDto eventUpdateDto, String currentUserEmail) {
        log.info("Updating event: {}", eventUpdateDto.getId());
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Event event = eventRepository.findById(eventUpdateDto.getId())
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user is admin of the club
        if (!event.getClub().getAdmins().contains(currentUser)) {
            throw new AccessDeniedException("You are not authorized to update this event");
        }
        
        // Check if event can be edited
        if (!event.canEdit()) {
            throw new RuntimeException("This event cannot be edited");
        }
        
        // Update event fields
        event.setTitle(eventUpdateDto.getTitle());
        event.setDescription(eventUpdateDto.getDescription());
        event.setEventDate(eventUpdateDto.getEventDate());
        event.setLocation(eventUpdateDto.getLocation());
        event.setCapacity(eventUpdateDto.getCapacity());
        event.setStatus(eventUpdateDto.getStatus());
        event.setRegistrationDeadline(eventUpdateDto.getRegistrationDeadline());
        event.setImageUrl(eventUpdateDto.getImageUrl());
        
        Event savedEvent = eventRepository.save(event);
        log.info("Event updated successfully: {}", savedEvent.getId());
        
        return convertToDto(savedEvent);
    }
    
    /**
     * Delete an event
     */
    public void deleteEvent(Long eventId, String currentUserEmail) {
        log.info("Deleting event: {}", eventId);
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user is admin of the club
        if (!event.getClub().getAdmins().contains(currentUser)) {
            throw new AccessDeniedException("You are not authorized to delete this event");
        }
        
        // Check if event can be deleted
        if (!event.canDelete()) {
            throw new RuntimeException("This event cannot be deleted as it has registrations");
        }
        
        eventRepository.delete(event);
        log.info("Event deleted successfully: {}", eventId);
    }
    
    /**
     * Get event by ID
     */
    @Transactional(readOnly = true)
    public EventDto getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDto(event);
    }
    
    /**
     * Get all published events
     */
    @Transactional(readOnly = true)
    public List<EventDto> getAllPublishedEvents() {
        return eventRepository.findPublishedEvents().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming published events
     */
    @Transactional(readOnly = true)
    public List<EventDto> getUpcomingEvents() {
        return eventRepository.findUpcomingPublishedEvents(LocalDateTime.now()).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get events by club admin
     */
    @Transactional(readOnly = true)
    public List<EventDto> getEventsByClubAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
        
        return eventRepository.findByClubAdmin(admin).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get upcoming events by club admin
     */
    @Transactional(readOnly = true)
    public List<EventDto> getUpcomingEventsByClubAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException("Admin user not found"));
        
        return eventRepository.findUpcomingByClubAdmin(admin, LocalDateTime.now()).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get events by club
     */
    @Transactional(readOnly = true)
    public List<EventDto> getEventsByClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
            .orElseThrow(() -> new RuntimeException("Club not found"));
        
        return eventRepository.findByClub(club).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Search published events
     */
    @Transactional(readOnly = true)
    public List<EventDto> searchEvents(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllPublishedEvents();
        }
        
        return eventRepository.searchPublishedEvents(searchTerm.trim()).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Publish a draft event
     */
    public EventDto publishEvent(Long eventId, String currentUserEmail) {
        log.info("Publishing event: {}", eventId);
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user is admin of the club
        if (!event.getClub().getAdmins().contains(currentUser)) {
            throw new AccessDeniedException("You are not authorized to publish this event");
        }
        
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new RuntimeException("Only draft events can be published");
        }
        
        event.setStatus(EventStatus.PUBLISHED);
        Event savedEvent = eventRepository.save(event);
        
        log.info("Event published successfully: {}", eventId);
        return convertToDto(savedEvent);
    }
    
    /**
     * Cancel an event
     */
    public EventDto cancelEvent(Long eventId, String currentUserEmail) {
        log.info("Cancelling event: {}", eventId);
        
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        // Check if user is admin of the club
        if (!event.getClub().getAdmins().contains(currentUser)) {
            throw new AccessDeniedException("You are not authorized to cancel this event");
        }
        
        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED) {
            throw new RuntimeException("This event cannot be cancelled");
        }
        
        event.setStatus(EventStatus.CANCELLED);
        Event savedEvent = eventRepository.save(event);
        
        log.info("Event cancelled successfully: {}", eventId);
        return convertToDto(savedEvent);
    }
    
    /**
     * Get clubs that user can create events for
     */
    @Transactional(readOnly = true)
    public List<Club> getClubsForEventCreation(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return clubRepository.findByAdmin(user);
    }
    
    /**
     * Convert Event entity to EventDto
     */
    private EventDto convertToDto(Event event) {
        return EventDto.builder()
            .id(event.getId())
            .title(event.getTitle())
            .description(event.getDescription())
            .clubId(event.getClub().getId())
            .clubName(event.getClub().getName())
            .eventDate(event.getEventDate())
            .location(event.getLocation())
            .capacity(event.getCapacity())
            .status(event.getStatus())
            .createdById(event.getCreatedBy().getId())
            .createdByName(event.getCreatedBy().getName())
            .imageUrl(event.getImageUrl())
            .registrationDeadline(event.getRegistrationDeadline())
            .registrationCount(event.getRegistrationCount())
            .attendanceCount(event.getAttendanceCount())
            .createdAt(event.getCreatedAt())
            .updatedAt(event.getUpdatedAt())
            .build();
    }
} 