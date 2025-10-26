package com.clubbing.clubbing.repository;

import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.ClubMembership;
import com.clubbing.clubbing.model.MembershipStatus;
import com.clubbing.clubbing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {
    
    // Find membership by user and club
    Optional<ClubMembership> findByUserAndClub(User user, Club club);
    
    // Find all memberships for a user
    List<ClubMembership> findByUser(User user);
    
    // Find all memberships for a club
    List<ClubMembership> findByClub(Club club);
    
    // Find memberships by status
    List<ClubMembership> findByStatus(MembershipStatus status);
    
    // Find memberships by club and status
    List<ClubMembership> findByClubAndStatus(Club club, MembershipStatus status);
    
    // Find active memberships for a user
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.user = :user AND cm.status = 'APPROVED'")
    List<ClubMembership> findActiveByUser(@Param("user") User user);
    
    // Find active memberships for a club
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'APPROVED'")
    List<ClubMembership> findActiveByClub(@Param("club") Club club);
    
    // Find pending requests for a club
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'PENDING' ORDER BY cm.requestedAt ASC")
    List<ClubMembership> findPendingByClub(@Param("club") Club club);
    
    // Find pending requests for clubs managed by a user (club admin)
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club IN " +
           "(SELECT c FROM Club c JOIN c.admins a WHERE a = :admin) AND cm.status = 'PENDING' " +
           "ORDER BY cm.requestedAt ASC")
    List<ClubMembership> findPendingByClubAdmin(@Param("admin") User admin);
    
    // Count active members for a club
    @Query("SELECT COUNT(cm) FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'APPROVED'")
    long countActiveByClub(@Param("club") Club club);
    
    // Count pending requests for a club
    @Query("SELECT COUNT(cm) FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'PENDING'")
    long countPendingByClub(@Param("club") Club club);
    
    // Check if user is already a member or has pending request
    @Query("SELECT COUNT(cm) > 0 FROM ClubMembership cm WHERE cm.user = :user AND cm.club = :club " +
           "AND cm.status IN ('APPROVED', 'PENDING')")
    boolean existsByUserAndClubAndActiveOrPending(@Param("user") User user, @Param("club") Club club);
    
    // Find all clubs a user is a member of
    @Query("SELECT cm.club FROM ClubMembership cm WHERE cm.user = :user AND cm.status = 'APPROVED'")
    List<Club> findClubsByUser(@Param("user") User user);
    
    // Find all users who are members of a club
    @Query("SELECT cm.user FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'APPROVED'")
    List<User> findUsersByClub(@Param("club") Club club);
    
    // Find memberships with leadership roles
    @Query("SELECT cm FROM ClubMembership cm WHERE cm.club = :club AND cm.status = 'APPROVED' " +
           "AND cm.role IN ('OFFICER', 'VICE_PRESIDENT', 'PRESIDENT') ORDER BY cm.role DESC")
    List<ClubMembership> findLeadershipByClub(@Param("club") Club club);
} 