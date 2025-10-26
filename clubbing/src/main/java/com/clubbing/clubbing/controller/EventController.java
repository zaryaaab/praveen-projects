package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.EventCreationDto;
import com.clubbing.clubbing.dto.EventDto;
import com.clubbing.clubbing.dto.EventUpdateDto;
import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {
    
    private final EventService eventService;
    
    /**
     * Show all published events (public view)
     */
    @GetMapping
    public String showAllEvents(@RequestParam(value = "search", required = false) String search, Model model) {
        log.info("Showing all events with search: {}", search);
        
        List<EventDto> events;
        if (search != null && !search.trim().isEmpty()) {
            events = eventService.searchEvents(search);
            model.addAttribute("searchTerm", search);
        } else {
            events = eventService.getAllPublishedEvents();
        }
        
        model.addAttribute("events", events);
        model.addAttribute("upcomingEvents", eventService.getUpcomingEvents());
        
        return "events/list";
    }
    
    /**
     * Show event details
     */
    @GetMapping("/{id}")
    public String showEventDetails(@PathVariable Long id, Model model) {
        log.info("Showing event details for ID: {}", id);
        
        try {
            EventDto event = eventService.getEventById(id);
            model.addAttribute("event", event);
            return "events/view";
        } catch (RuntimeException e) {
            log.error("Error showing event details: {}", e.getMessage());
            model.addAttribute("error", "Event not found");
            return "redirect:/events";
        }
    }
    
    /**
     * Show create event form (Club Admin only)
     */
    @GetMapping("/create")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String showCreateEventForm(Model model, Authentication authentication) {
        log.info("Showing create event form for user: {}", authentication.getName());
        
        List<Club> clubs = eventService.getClubsForEventCreation(authentication.getName());
        
        if (clubs.isEmpty()) {
            model.addAttribute("error", "You are not an admin of any clubs. Please contact a system administrator.");
            return "redirect:/club-admin/dashboard";
        }
        
        model.addAttribute("eventCreationDto", new EventCreationDto());
        model.addAttribute("clubs", clubs);
        
        return "events/create";
    }
    
    /**
     * Process create event form
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String createEvent(@Valid @ModelAttribute EventCreationDto eventCreationDto,
                             BindingResult bindingResult,
                             Model model,
                             Authentication authentication,
                             RedirectAttributes redirectAttributes) {
        
        log.info("Processing create event for user: {}", authentication.getName());
        
        if (bindingResult.hasErrors()) {
            List<Club> clubs = eventService.getClubsForEventCreation(authentication.getName());
            model.addAttribute("clubs", clubs);
            return "events/create";
        }
        
        try {
            EventDto createdEvent = eventService.createEvent(eventCreationDto, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Event '" + createdEvent.getTitle() + "' created successfully!");
            return "redirect:/events/" + createdEvent.getId();
        } catch (Exception e) {
            log.error("Error creating event: {}", e.getMessage());
            List<Club> clubs = eventService.getClubsForEventCreation(authentication.getName());
            model.addAttribute("clubs", clubs);
            model.addAttribute("error", e.getMessage());
            return "events/create";
        }
    }
    
    /**
     * Show edit event form (Club Admin only)
     */
    @GetMapping("/{id}/edit")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String showEditEventForm(@PathVariable Long id, Model model, Authentication authentication) {
        log.info("Showing edit event form for ID: {} by user: {}", id, authentication.getName());
        
        try {
            EventDto event = eventService.getEventById(id);
            
            EventUpdateDto eventUpdateDto = EventUpdateDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .capacity(event.getCapacity())
                .status(event.getStatus())
                .registrationDeadline(event.getRegistrationDeadline())
                .imageUrl(event.getImageUrl())
                .currentRegistrationCount(event.getRegistrationCount())
                .build();
            
            model.addAttribute("eventUpdateDto", eventUpdateDto);
            model.addAttribute("event", event);
            
            return "events/edit";
        } catch (Exception e) {
            log.error("Error showing edit event form: {}", e.getMessage());
            model.addAttribute("error", e.getMessage());
            return "redirect:/club-admin/events";
        }
    }
    
    /**
     * Process edit event form
     */
    @PostMapping("/{id}/edit")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String updateEvent(@PathVariable Long id,
                             @Valid @ModelAttribute EventUpdateDto eventUpdateDto,
                             BindingResult bindingResult,
                             Model model,
                             Authentication authentication,
                             RedirectAttributes redirectAttributes) {
        
        log.info("Processing update event for ID: {} by user: {}", id, authentication.getName());
        
        if (bindingResult.hasErrors()) {
            EventDto event = eventService.getEventById(id);
            model.addAttribute("event", event);
            return "events/edit";
        }
        
        try {
            EventDto updatedEvent = eventService.updateEvent(eventUpdateDto, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Event '" + updatedEvent.getTitle() + "' updated successfully!");
            return "redirect:/events/" + updatedEvent.getId();
        } catch (Exception e) {
            log.error("Error updating event: {}", e.getMessage());
            EventDto event = eventService.getEventById(id);
            model.addAttribute("event", event);
            model.addAttribute("error", e.getMessage());
            return "events/edit";
        }
    }
    
    /**
     * Delete event (Club Admin only)
     */
    @PostMapping("/{id}/delete")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String deleteEvent(@PathVariable Long id,
                             Authentication authentication,
                             RedirectAttributes redirectAttributes) {
        
        log.info("Deleting event ID: {} by user: {}", id, authentication.getName());
        
        try {
            EventDto event = eventService.getEventById(id);
            eventService.deleteEvent(id, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Event '" + event.getTitle() + "' deleted successfully!");
        } catch (Exception e) {
            log.error("Error deleting event: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/club-admin/events";
    }
    
    /**
     * Publish event (Club Admin only)
     */
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String publishEvent(@PathVariable Long id,
                              Authentication authentication,
                              RedirectAttributes redirectAttributes) {
        
        log.info("Publishing event ID: {} by user: {}", id, authentication.getName());
        
        try {
            EventDto event = eventService.publishEvent(id, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Event '" + event.getTitle() + "' published successfully!");
        } catch (Exception e) {
            log.error("Error publishing event: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/events/" + id;
    }
    
    /**
     * Cancel event (Club Admin only)
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CLUB_ADMIN')")
    public String cancelEvent(@PathVariable Long id,
                             Authentication authentication,
                             RedirectAttributes redirectAttributes) {
        
        log.info("Cancelling event ID: {} by user: {}", id, authentication.getName());
        
        try {
            EventDto event = eventService.cancelEvent(id, authentication.getName());
            redirectAttributes.addFlashAttribute("success", 
                "Event '" + event.getTitle() + "' cancelled successfully!");
        } catch (Exception e) {
            log.error("Error cancelling event: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/events/" + id;
    }
} 