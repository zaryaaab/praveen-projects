package com.edusync.edusync.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    @ToString.Exclude
    private Assignment assignment;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    private Student student;
    
    @Column(nullable = false)
    private LocalDateTime submissionDate;
    
    @Column
    private String submissionContent;
    
    @Column
    private String fileName;
    
    @Column
    private String fileContentType;
    
    @Lob
    @Column(length = 16777215) // 16MB max file size
    private byte[] fileData;
    
    @Column
    private Integer obtainedMarks;
    
    @Column
    private String feedback;
    
    @Column
    private Boolean graded = false;
} 