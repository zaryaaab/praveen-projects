package com.edusync.edusync.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String courseCode;
    
    @Column(nullable = false)
    private String courseName;
    
    @Column
    private String description;
    
    @Column
    private Integer creditHours;
    
    @Column
    private String schedule;
    
    @ManyToOne
    @JoinColumn(name = "faculty_id")
    @ToString.Exclude
    private Faculty faculty;
    
    @ManyToMany(mappedBy = "courses", fetch = FetchType.EAGER)
    @ToString.Exclude
    private Set<Student> students = new HashSet<>();
    
    @OneToMany(mappedBy = "course")
    @ToString.Exclude
    private Set<Assignment> assignments = new HashSet<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private Set<CourseSchedule> schedules = new HashSet<>();
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Course course = (Course) o;
        return Objects.equals(id, course.id) &&
               Objects.equals(courseCode, course.courseCode) &&
               Objects.equals(courseName, course.courseName) &&
               Objects.equals(description, course.description) &&
               Objects.equals(creditHours, course.creditHours) &&
               Objects.equals(schedule, course.schedule);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, courseCode, courseName, description, creditHours, schedule);
    }
} 