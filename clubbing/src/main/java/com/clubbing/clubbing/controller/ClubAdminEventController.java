package com.clubbing.clubbing.controller;

import com.clubbing.clubbing.dto.EventDto;
import com.clubbing.clubbing.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/club-admin/events")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('CLUB_ADMIN')")
public class ClubAdminEventController {
    
    private final EventService eventService;
    
    /**
     * Show club admin events dashboard
     */
    @GetMapping
    public String showEventsDashboard(Model model, Authentication authentication) {
        log.info("Showing events dashboard for club admin: {}", authentication.getName());
        
        List<EventDto> allEvents = eventService.getEventsByClubAdmin(authentication.getName());
        List<EventDto> upcomingEvents = eventService.getUpcomingEventsByClubAdmin(authentication.getName());
        
        model.addAttribute("allEvents", allEvents);
        model.addAttribute("upcomingEvents", upcomingEvents);
        model.addAttribute("totalEvents", allEvents.size());
        model.addAttribute("upcomingCount", upcomingEvents.size());
        
        // Calculate statistics
        long draftCount = allEvents.stream().filter(e -> e.getStatus().name().equals("DRAFT")).count();
        long publishedCount = allEvents.stream().filter(e -> e.getStatus().name().equals("PUBLISHED")).count();
        long completedCount = allEvents.stream().filter(e -> e.getStatus().name().equals("COMPLETED")).count();
        
        model.addAttribute("draftCount", draftCount);
        model.addAttribute("publishedCount", publishedCount);
        model.addAttribute("completedCount", completedCount);
        
        return "club-admin/events/dashboard";
    }
    
    /**
     * Show events by status filter
     */
    @GetMapping("/filter")
    public String showEventsByStatus(@RequestParam(value = "status", required = false) String status,
                                   Model model, 
                                   Authentication authentication) {
        
        log.info("Showing events filtered by status: {} for admin: {}", status, authentication.getName());
        
        List<EventDto> events = eventService.getEventsByClubAdmin(authentication.getName());
        
        if (status != null && !status.isEmpty()) {
            events = events.stream()
                .filter(e -> e.getStatus().name().equalsIgnoreCase(status))
                .toList();
            model.addAttribute("filterStatus", status);
        }
        
        model.addAttribute("events", events);
        model.addAttribute("allEvents", eventService.getEventsByClubAdmin(authentication.getName()));
        
        return "club-admin/events/list";
    }
} 