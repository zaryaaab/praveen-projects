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
@Table(name = "faculty")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Faculty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String facultyId;
    
    @Column
    private String department;
    
    @Column
    private String designation;
    
    @Column
    private String officeHours;
    
    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude
    private Set<Course> courses = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Faculty faculty = (Faculty) o;
        return Objects.equals(id, faculty.id) &&
               Objects.equals(user, faculty.user) &&
               Objects.equals(facultyId, faculty.facultyId) &&
               Objects.equals(department, faculty.department) &&
               Objects.equals(designation, faculty.designation) &&
               Objects.equals(officeHours, faculty.officeHours);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, user, facultyId, department, designation, officeHours);
    }
} 