package com.edusync.edusync.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "course_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;
    
    @Column(nullable = false)
    private LocalTime startTime;
    
    @Column(nullable = false)
    private LocalTime endTime;
    
    @Column(nullable = false)
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleType type;
    
    public enum ScheduleType {
        LECTURE,
        LAB,
        TUTORIAL,
        DISCUSSION,
        OFFICE_HOURS
    }
    
    /**
     * Returns a formatted string representing this schedule
     * For example: "MON 10:00 AM - 11:30 AM (LEC)"
     */
    public String getFormattedSchedule() {
        String dayStr = dayOfWeek.toString().substring(0, 3);
        String typeStr = type.toString().substring(0, 3);
        return String.format("%s %s - %s (%s)", 
                            dayStr, 
                            startTime.toString(), 
                            endTime.toString(),
                            typeStr);
    }
} 