package com.clubbing.clubbing.service;

import com.clubbing.clubbing.dto.*;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.ClubMembership;
import com.clubbing.clubbing.repository.UserRepository;
import com.clubbing.clubbing.repository.ClubMembershipRepository;
import com.clubbing.clubbing.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubRepository clubRepository;

    /**
     * Register a new user
     */
    public User registerUser(UserRegistrationDto registrationDto) {
        log.info("Registering new user with email: {}", registrationDto.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Check if student ID already exists (if provided)
        if (registrationDto.getStudentId() != null && !registrationDto.getStudentId().trim().isEmpty()) {
            if (userRepository.existsByStudentId(registrationDto.getStudentId())) {
                throw new RuntimeException("Student ID already registered");
            }
        }
        
        // Check if passwords match
        if (!registrationDto.isPasswordMatching()) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = User.builder()
                .name(registrationDto.getName())
                .email(registrationDto.getEmail().toLowerCase())
                .password(passwordEncoder.encode(registrationDto.getPassword()))
                .studentId(registrationDto.getStudentId())
                .department(registrationDto.getDepartment())
                .role(UserRole.STUDENT) // Default role
                .isActive(true)
                .emailVerified(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    /**
     * Get current authenticated user
     */
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return userRepository.findByEmail(authentication.getName());
        }
        return Optional.empty();
    }

    /**
     * Update user profile
     */
    public User updateProfile(UserProfileDto profileDto) {
        User currentUser = getCurrentUser()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        // Check if email is being changed and is not already taken by another user
        if (!currentUser.getEmail().equals(profileDto.getEmail().toLowerCase())) {
            if (userRepository.existsByEmail(profileDto.getEmail())) {
                throw new RuntimeException("Email already in use by another user");
            }
        }

        // Check if student ID is being changed and is not already taken by another user
        if (profileDto.getStudentId() != null && !profileDto.getStudentId().trim().isEmpty()) {
            if (!profileDto.getStudentId().equals(currentUser.getStudentId())) {
                if (userRepository.existsByStudentId(profileDto.getStudentId())) {
                    throw new RuntimeException("Student ID already in use by another user");
                }
            }
        }

        currentUser.setName(profileDto.getName());
        currentUser.setEmail(profileDto.getEmail().toLowerCase());
        currentUser.setStudentId(profileDto.getStudentId());
        currentUser.setDepartment(profileDto.getDepartment());

        User updatedUser = userRepository.save(currentUser);
        log.info("Profile updated for user ID: {}", updatedUser.getId());
        return updatedUser;
    }

    /**
     * Change user password
     */
    public void changePassword(PasswordChangeDto passwordChangeDto) {
        User currentUser = getCurrentUser()
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        // Verify current password
        if (!passwordEncoder.matches(passwordChangeDto.getCurrentPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Check if new passwords match
        if (!passwordChangeDto.isPasswordMatching()) {
            throw new RuntimeException("New passwords do not match");
        }

        currentUser.setPassword(passwordEncoder.encode(passwordChangeDto.getNewPassword()));
        userRepository.save(currentUser);
        log.info("Password changed for user ID: {}", currentUser.getId());
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Get all users as DTOs (for admin)
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID as DTO (for admin)
     */
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDto);
    }

    /**
     * Get users by role
     */
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Search users (for admin)
     */
    public List<User> searchUsers(String searchTerm) {
        return userRepository.searchUsers(searchTerm);
    }

    /**
     * Toggle user status and return DTO (for admin)
     */
    public UserDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setActive(!user.isActive());
        User updatedUser = userRepository.save(user);
        log.info("User status toggled for user ID: {} - Active: {}", userId, user.isActive());
        return convertToDto(updatedUser);
    }

    /**
     * Update user role and return DTO (for admin)
     */
    public UserDto updateUserRole(Long userId, UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        UserRole oldRole = user.getRole();
        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        log.info("User role updated for user ID: {} - From: {} To: {}", userId, oldRole, newRole);
        return convertToDto(updatedUser);
    }

    /**
     * Delete user (for admin)
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        log.info("Starting deletion process for user ID: {} ({})", userId, user.getEmail());
        
        // 1. Remove user from all club admin relationships
        List<Club> adminClubs = clubRepository.findByAdmin(user);
        for (Club club : adminClubs) {
            club.removeAdmin(user);
            clubRepository.save(club);
            log.debug("Removed user {} as admin from club {}", user.getEmail(), club.getName());
        }
        
        // 2. Handle club memberships where user is the member
        List<ClubMembership> userMemberships = clubMembershipRepository.findByUser(user);
        for (ClubMembership membership : userMemberships) {
            // Update club member count if membership was active
            if (membership.isActive()) {
                Club club = membership.getClub();
                club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
                clubRepository.save(club);
            }
            clubMembershipRepository.delete(membership);
            log.debug("Deleted membership {} for user {}", membership.getId(), user.getEmail());
        }
        
        // 3. Handle club memberships where user is the processor (processed_by)
        // Set processed_by to null for memberships processed by this user
        List<ClubMembership> processedMemberships = clubMembershipRepository.findAll().stream()
                .filter(membership -> membership.getProcessedBy() != null && 
                       membership.getProcessedBy().getId().equals(userId))
                .collect(Collectors.toList());
        
        for (ClubMembership membership : processedMemberships) {
            membership.setProcessedBy(null);
            membership.setNotes(membership.getNotes() + " [Processed by deleted user: " + user.getEmail() + "]");
            clubMembershipRepository.save(membership);
            log.debug("Updated processed_by reference for membership {}", membership.getId());
        }
        
        // 4. Finally delete the user
        userRepository.delete(user);
        log.info("User deleted successfully with ID: {} ({})", userId, user.getEmail());
    }

    /**
     * Get user statistics
     */
    public UserStats getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long systemAdmins = userRepository.countByRole(UserRole.SYSTEM_ADMIN);
        long clubAdmins = userRepository.countByRole(UserRole.CLUB_ADMIN);
        long students = userRepository.countByRole(UserRole.STUDENT);
        
        return new UserStats(totalUsers, activeUsers, systemAdmins, clubAdmins, students);
    }

    /**
     * Convert User entity to UserDto
     */
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .role(user.getRole())
                .isActive(user.isActive())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // Inner class for user statistics
    public record UserStats(
            long totalUsers,
            long activeUsers,
            long systemAdmins,
            long clubAdmins,
            long students
    ) {}
} 