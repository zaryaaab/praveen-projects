package com.clubbing.clubbing.service;

import com.clubbing.clubbing.dto.MembershipDto;
import com.clubbing.clubbing.dto.MembershipRequestDto;
import com.clubbing.clubbing.model.*;
import com.clubbing.clubbing.repository.ClubMembershipRepository;
import com.clubbing.clubbing.repository.ClubRepository;
import com.clubbing.clubbing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MembershipService {
    
    private final ClubMembershipRepository membershipRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    
    /**
     * Request to join a club (Student)
     */
    public MembershipDto requestToJoinClub(Long clubId, User user, MembershipRequestDto requestDto) {
        log.info("User {} requesting to join club {}", user.getEmail(), clubId);
        
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        if (!club.isActive()) {
            throw new IllegalArgumentException("Cannot join inactive club");
        }
        
        // Check if user already has a membership or pending request
        if (membershipRepository.existsByUserAndClubAndActiveOrPending(user, club)) {
            throw new IllegalArgumentException("You already have an active membership or pending request for this club");
        }
        
        // Create membership request
        ClubMembership membership = ClubMembership.builder()
                .user(user)
                .club(club)
                .status(MembershipStatus.PENDING)
                .role(MemberRole.MEMBER)
                .notes(requestDto.getMessage())
                .build();
        
        ClubMembership savedMembership = membershipRepository.save(membership);
        log.info("Membership request created with ID: {}", savedMembership.getId());
        
        return convertToDto(savedMembership);
    }
    
    /**
     * Approve membership request (Club Admin)
     */
    public MembershipDto approveMembershipRequest(Long membershipId, User approver) {
        log.info("User {} approving membership request {}", approver.getEmail(), membershipId);
        
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership request not found"));
        
        if (!membership.isPending()) {
            throw new IllegalArgumentException("Membership request is not pending");
        }
        
        // Check if approver can manage this club
        if (!membership.getClub().hasAdmin(approver) && !approver.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to approve this request");
        }
        
        membership.approve(approver);
        ClubMembership savedMembership = membershipRepository.save(membership);
        
        // Update club member count
        updateClubMemberCount(membership.getClub());
        
        log.info("Membership request approved for user {} in club {}", 
                membership.getUser().getEmail(), membership.getClub().getName());
        
        return convertToDto(savedMembership);
    }
    
    /**
     * Reject membership request (Club Admin)
     */
    public MembershipDto rejectMembershipRequest(Long membershipId, User rejector, String reason) {
        log.info("User {} rejecting membership request {}", rejector.getEmail(), membershipId);
        
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership request not found"));
        
        if (!membership.isPending()) {
            throw new IllegalArgumentException("Membership request is not pending");
        }
        
        // Check if rejector can manage this club
        if (!membership.getClub().hasAdmin(rejector) && !rejector.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to reject this request");
        }
        
        membership.reject(rejector, reason);
        ClubMembership savedMembership = membershipRepository.save(membership);
        
        log.info("Membership request rejected for user {} in club {}", 
                membership.getUser().getEmail(), membership.getClub().getName());
        
        return convertToDto(savedMembership);
    }
    
    /**
     * Leave club (Student)
     */
    public void leaveClub(Long clubId, User user) {
        log.info("User {} leaving club {}", user.getEmail(), clubId);
        
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        Optional<ClubMembership> membershipOpt = membershipRepository.findByUserAndClub(user, club);
        if (membershipOpt.isEmpty() || !membershipOpt.get().isActive()) {
            throw new IllegalArgumentException("You are not a member of this club");
        }
        
        ClubMembership membership = membershipOpt.get();
        membership.leave();
        membershipRepository.save(membership);
        
        // Update club member count
        updateClubMemberCount(club);
        
        log.info("User {} left club {}", user.getEmail(), club.getName());
    }
    
    /**
     * Get pending requests for a club (Club Admin)
     */
    @Transactional(readOnly = true)
    public List<MembershipDto> getPendingRequestsForClub(Long clubId, User admin) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        // Check if admin can manage this club
        if (!club.hasAdmin(admin) && !admin.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to view requests for this club");
        }
        
        List<ClubMembership> pendingRequests = membershipRepository.findPendingByClub(club);
        return pendingRequests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all pending requests for clubs managed by admin
     */
    @Transactional(readOnly = true)
    public List<MembershipDto> getPendingRequestsForAdmin(User admin) {
        List<ClubMembership> pendingRequests = membershipRepository.findPendingByClubAdmin(admin);
        return pendingRequests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get club members (Club Admin)
     */
    @Transactional(readOnly = true)
    public List<MembershipDto> getClubMembers(Long clubId, User admin) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        // Check if admin can manage this club
        if (!club.hasAdmin(admin) && !admin.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to view members of this club");
        }
        
        List<ClubMembership> members = membershipRepository.findActiveByClub(club);
        return members.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user's club memberships (Student)
     */
    @Transactional(readOnly = true)
    public List<MembershipDto> getUserMemberships(User user) {
        List<ClubMembership> memberships = membershipRepository.findActiveByUser(user);
        return memberships.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user's membership status for a specific club
     */
    @Transactional(readOnly = true)
    public Optional<MembershipDto> getUserMembershipForClub(Long clubId, User user) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        Optional<ClubMembership> membershipOpt = membershipRepository.findByUserAndClub(user, club);
        return membershipOpt.map(this::convertToDto);
    }
    
    /**
     * Check if user can join a club
     */
    @Transactional(readOnly = true)
    public boolean canUserJoinClub(Long clubId, User user) {
        Club club = clubRepository.findById(clubId)
                .orElse(null);
        
        if (club == null || !club.isActive()) {
            return false;
        }
        
        return !membershipRepository.existsByUserAndClubAndActiveOrPending(user, club);
    }
    
    /**
     * Update member role (Club Admin)
     */
    public MembershipDto updateMemberRole(Long membershipId, MemberRole newRole, User admin) {
        log.info("User {} updating member role for membership {}", admin.getEmail(), membershipId);
        
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
        
        if (!membership.isActive()) {
            throw new IllegalArgumentException("Cannot update role for inactive membership");
        }
        
        // Check if admin can manage this club
        if (!membership.getClub().hasAdmin(admin) && !admin.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to update roles in this club");
        }
        
        membership.setRole(newRole);
        ClubMembership savedMembership = membershipRepository.save(membership);
        
        log.info("Member role updated to {} for user {} in club {}", 
                newRole, membership.getUser().getEmail(), membership.getClub().getName());
        
        return convertToDto(savedMembership);
    }
    
    /**
     * Remove member from club (Club Admin)
     */
    public void removeMemberFromClub(Long membershipId, User admin, String reason) {
        log.info("User {} removing member with membership {}", admin.getEmail(), membershipId);
        
        ClubMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));
        
        if (!membership.isActive()) {
            throw new IllegalArgumentException("Member is not active");
        }
        
        // Check if admin can manage this club
        if (!membership.getClub().hasAdmin(admin) && !admin.isSystemAdmin()) {
            throw new IllegalArgumentException("You don't have permission to remove members from this club");
        }
        
        membership.setStatus(MembershipStatus.SUSPENDED);
        membership.setProcessedAt(java.time.LocalDateTime.now());
        membership.setProcessedBy(admin);
        membership.setNotes(reason);
        
        membershipRepository.save(membership);
        
        // Update club member count
        updateClubMemberCount(membership.getClub());
        
        log.info("Member {} removed from club {}", 
                membership.getUser().getEmail(), membership.getClub().getName());
    }
    
    /**
     * Get membership statistics for a club
     */
    @Transactional(readOnly = true)
    public MembershipStats getMembershipStats(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found"));
        
        long activeMembers = membershipRepository.countActiveByClub(club);
        long pendingRequests = membershipRepository.countPendingByClub(club);
        List<ClubMembership> leadership = membershipRepository.findLeadershipByClub(club);
        
        return MembershipStats.builder()
                .clubId(clubId)
                .activeMembers(activeMembers)
                .pendingRequests(pendingRequests)
                .leadershipCount(leadership.size())
                .build();
    }
    
    /**
     * Update club member count
     */
    private void updateClubMemberCount(Club club) {
        long memberCount = membershipRepository.countActiveByClub(club);
        club.setMemberCount((int) memberCount);
        clubRepository.save(club);
    }
    
    /**
     * Recalculate member counts for all clubs
     * This method ensures all clubs have accurate member counts based on actual membership data
     */
    public void recalculateAllClubMemberCounts() {
        log.info("Recalculating member counts for all clubs...");
        
        List<Club> allClubs = clubRepository.findAll();
        int updatedCount = 0;
        
        for (Club club : allClubs) {
            long actualMemberCount = membershipRepository.countActiveByClub(club);
            int currentMemberCount = club.getMemberCount();
            
            if (currentMemberCount != actualMemberCount) {
                club.setMemberCount((int) actualMemberCount);
                clubRepository.save(club);
                updatedCount++;
                log.debug("Updated member count for club '{}': {} -> {}", 
                         club.getName(), currentMemberCount, actualMemberCount);
            }
        }
        
        log.info("Member count recalculation completed. Updated {} clubs.", updatedCount);
    }
    
    /**
     * Convert ClubMembership entity to DTO
     */
    private MembershipDto convertToDto(ClubMembership membership) {
        return MembershipDto.builder()
                .id(membership.getId())
                .userId(membership.getUser().getId())
                .userName(membership.getUser().getName())
                .userEmail(membership.getUser().getEmail())
                .clubId(membership.getClub().getId())
                .clubName(membership.getClub().getName())
                .status(membership.getStatus())
                .role(membership.getRole())
                .joinedAt(membership.getJoinedAt())
                .requestedAt(membership.getRequestedAt())
                .processedAt(membership.getProcessedAt())
                .processedByName(membership.getProcessedBy() != null ? 
                        membership.getProcessedBy().getName() : null)
                .notes(membership.getNotes())
                .createdAt(membership.getCreatedAt())
                .updatedAt(membership.getUpdatedAt())
                .build();
    }
    
    /**
     * Inner class for membership statistics
     */
    @lombok.Data
    @lombok.Builder
    public static class MembershipStats {
        private Long clubId;
        private long activeMembers;
        private long pendingRequests;
        private long leadershipCount;
    }
} 