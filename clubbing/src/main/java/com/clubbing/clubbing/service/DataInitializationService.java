package com.clubbing.clubbing.service;

import com.clubbing.clubbing.model.Club;
import com.clubbing.clubbing.model.User;
import com.clubbing.clubbing.model.UserRole;
import com.clubbing.clubbing.repository.ClubRepository;
import com.clubbing.clubbing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final MembershipService membershipService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultUsers();
        initializeDefaultClubs();
        
        // Recalculate member counts to ensure accuracy
        membershipService.recalculateAllClubMemberCounts();
    }

    private void initializeDefaultUsers() {
        initializeDefaultAdmin();
        initializeDefaultStudent();
        initializeDefaultClubAdmins();
    }

    private void initializeDefaultAdmin() {
        String adminEmail = "admin@clubbing.com";
        
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .studentId("ADMIN001")
                    .department("Administration")
                    .role(UserRole.SYSTEM_ADMIN)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("Default system admin created with email: {} and password: admin123", adminEmail);
            log.warn("IMPORTANT: Please change the default admin password after first login!");
        } else {
            log.info("System admin already exists, skipping initialization");
        }
    }

    private void initializeDefaultStudent() {
        String studentEmail = "student@clubbing.com";
        
        if (userRepository.findByEmail(studentEmail).isEmpty()) {
            User student = User.builder()
                    .name("John Doe")
                    .email(studentEmail)
                    .password(passwordEncoder.encode("student123"))
                    .studentId("STU001")
                    .department("Computer Science")
                    .role(UserRole.STUDENT)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(student);
            log.info("Default student user created with email: {} and password: student123", studentEmail);
        } else {
            log.info("Default student already exists, skipping initialization");
        }
    }

    private void initializeDefaultClubAdmins() {
        // Create club admin 1
        String clubAdmin1Email = "clubadmin1@clubbing.com";
        if (userRepository.findByEmail(clubAdmin1Email).isEmpty()) {
            User clubAdmin1 = User.builder()
                    .name("Alice Johnson")
                    .email(clubAdmin1Email)
                    .password(passwordEncoder.encode("clubadmin123"))
                    .studentId("CA001")
                    .department("Computer Science")
                    .role(UserRole.CLUB_ADMIN)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(clubAdmin1);
            log.info("Default club admin 1 created with email: {} and password: clubadmin123", clubAdmin1Email);
        }

        // Create club admin 2
        String clubAdmin2Email = "clubadmin2@clubbing.com";
        if (userRepository.findByEmail(clubAdmin2Email).isEmpty()) {
            User clubAdmin2 = User.builder()
                    .name("Bob Smith")
                    .email(clubAdmin2Email)
                    .password(passwordEncoder.encode("clubadmin123"))
                    .studentId("CA002")
                    .department("Business Administration")
                    .role(UserRole.CLUB_ADMIN)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(clubAdmin2);
            log.info("Default club admin 2 created with email: {} and password: clubadmin123", clubAdmin2Email);
        }
    }

    private void initializeDefaultClubs() {
        if (clubRepository.count() == 0) {
            log.info("Initializing default clubs...");

            // Get club admins
            User clubAdmin1 = userRepository.findByEmail("clubadmin1@clubbing.com").orElse(null);
            User clubAdmin2 = userRepository.findByEmail("clubadmin2@clubbing.com").orElse(null);

            // Create Technology Club
            Club techClub = Club.builder()
                    .name("Technology Club")
                    .description("A club for technology enthusiasts to learn, share, and collaborate on various tech projects. We organize workshops, hackathons, and tech talks.")
                    .category("Technology")
                    .establishmentDate(LocalDate.of(2020, 9, 1))
                    .logoUrl("https://picsum.photos/150/150?random=1")
                    .isActive(true)
                    .memberCount(0) // Start with 0, will be updated when members join
                    .build();

            if (clubAdmin1 != null) {
                techClub.addAdmin(clubAdmin1);
            }

            clubRepository.save(techClub);
            log.info("Technology Club created successfully");

            // Create Business Club
            Club businessClub = Club.builder()
                    .name("Business Club")
                    .description("Dedicated to developing business skills and entrepreneurial mindset among students. We host networking events, business plan competitions, and guest lectures.")
                    .category("Business")
                    .establishmentDate(LocalDate.of(2019, 8, 15))
                    .logoUrl("https://picsum.photos/150/150?random=2")
                    .isActive(true)
                    .memberCount(0) // Start with 0, will be updated when members join
                    .build();

            if (clubAdmin2 != null) {
                businessClub.addAdmin(clubAdmin2);
            }

            clubRepository.save(businessClub);
            log.info("Business Club created successfully");

            // Create Sports Club
            Club sportsClub = Club.builder()
                    .name("Sports Club")
                    .description("Promoting physical fitness and sportsmanship through various athletic activities. We organize tournaments, fitness sessions, and outdoor adventures.")
                    .category("Sports")
                    .establishmentDate(LocalDate.of(2018, 1, 10))
                    .logoUrl("https://picsum.photos/150/150?random=3")
                    .isActive(true)
                    .memberCount(0) // Start with 0, will be updated when members join
                    .build();

            if (clubAdmin1 != null) {
                sportsClub.addAdmin(clubAdmin1);
            }

            clubRepository.save(sportsClub);
            log.info("Sports Club created successfully");

            // Create Arts Club
            Club artsClub = Club.builder()
                    .name("Arts & Culture Club")
                    .description("Celebrating creativity and cultural diversity through art, music, drama, and cultural events. Join us to express your artistic talents.")
                    .category("Arts")
                    .establishmentDate(LocalDate.of(2021, 2, 20))
                    .logoUrl("https://picsum.photos/150/150?random=4")
                    .isActive(true)
                    .memberCount(0) // Start with 0, will be updated when members join
                    .build();

            if (clubAdmin2 != null) {
                artsClub.addAdmin(clubAdmin2);
            }

            clubRepository.save(artsClub);
            log.info("Arts & Culture Club created successfully");

            // Create Academic Club
            Club academicClub = Club.builder()
                    .name("Academic Excellence Club")
                    .description("Supporting academic growth through study groups, tutoring sessions, and academic competitions. Excellence in education is our mission.")
                    .category("Academic")
                    .establishmentDate(LocalDate.of(2020, 3, 5))
                    .logoUrl(null) // No logo URL - will use fallback icon
                    .isActive(false) // One inactive club for testing
                    .memberCount(0) // Start with 0, will be updated when members join
                    .build();

            clubRepository.save(academicClub);
            log.info("Academic Excellence Club created successfully (inactive for testing)");

            log.info("Default clubs initialization completed");
        } else {
            log.info("Clubs already exist, skipping club initialization");
        }
    }
} 