package com.edusync.edusync.repository;

import com.edusync.edusync.model.Faculty;
import com.edusync.edusync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUser(User user);
    Optional<Faculty> findByFacultyId(String facultyId);
} 