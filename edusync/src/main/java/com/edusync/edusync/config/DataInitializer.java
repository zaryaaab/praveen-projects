package com.edusync.edusync.config;

import com.edusync.edusync.model.*;
import com.edusync.edusync.repository.*;
import com.edusync.edusync.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final StudentService studentService;
    private final FacultyService facultyService;
    private final CourseService courseService;
    private final AssignmentService assignmentService;
    private final AnnouncementService announcementService;
    private final ExamService examService;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;

    @Autowired
    public DataInitializer(UserService userService, StudentService studentService,
                          FacultyService facultyService, CourseService courseService,
                          AssignmentService assignmentService, AnnouncementService announcementService,
                          ExamService examService, UserRepository userRepository, 
                          FacultyRepository facultyRepository) {
        this.userService = userService;
        this.studentService = studentService;
        this.facultyService = facultyService;
        this.courseService = courseService;
        this.assignmentService = assignmentService;
        this.announcementService = announcementService;
        this.examService = examService;
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            // Create admin user
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword("admin123");
            adminUser.setFullName("System Administrator");
            adminUser.setEmail("admin@edusync.com");
            adminUser.setRole(User.Role.ADMIN);
            userService.saveUser(adminUser);

            // Create faculty users
            User facultyUser1 = new User();
            facultyUser1.setUsername("professor1");
            facultyUser1.setPassword("faculty123");
            facultyUser1.setFullName("John Smith");
            facultyUser1.setEmail("john.smith@edusync.com");
            facultyUser1.setRole(User.Role.FACULTY);
            userService.saveUser(facultyUser1);

            User facultyUser2 = new User();
            facultyUser2.setUsername("professor2");
            facultyUser2.setPassword("faculty123");
            facultyUser2.setFullName("Emily Johnson");
            facultyUser2.setEmail("emily.johnson@edusync.com");
            facultyUser2.setRole(User.Role.FACULTY);
            userService.saveUser(facultyUser2);

            // Create student users
            User studentUser1 = new User();
            studentUser1.setUsername("student1");
            studentUser1.setPassword("student123");
            studentUser1.setFullName("Alice Brown");
            studentUser1.setEmail("alice.brown@edusync.com");
            studentUser1.setRole(User.Role.STUDENT);
            userService.saveUser(studentUser1);

            User studentUser2 = new User();
            studentUser2.setUsername("student2");
            studentUser2.setPassword("student123");
            studentUser2.setFullName("Bob Wilson");
            studentUser2.setEmail("bob.wilson@edusync.com");
            studentUser2.setRole(User.Role.STUDENT);
            userService.saveUser(studentUser2);

            // Refresh users from database
            facultyUser1 = userRepository.findById(facultyUser1.getId()).orElse(facultyUser1);
            facultyUser2 = userRepository.findById(facultyUser2.getId()).orElse(facultyUser2);
            studentUser1 = userRepository.findById(studentUser1.getId()).orElse(studentUser1);
            studentUser2 = userRepository.findById(studentUser2.getId()).orElse(studentUser2);

            // Create faculty profiles - direct database insert to avoid JPA issues
            Faculty faculty1 = new Faculty();
            faculty1.setUser(facultyUser1);
            faculty1.setFacultyId("F001");
            faculty1.setDepartment("Computer Science");
            faculty1.setDesignation("Associate Professor");
            faculty1.setOfficeHours("Monday, Wednesday 2-4 PM");
            faculty1.setCourses(new HashSet<>());
            Faculty savedFaculty1 = facultyRepository.save(faculty1);

            Faculty faculty2 = new Faculty();
            faculty2.setUser(facultyUser2);
            faculty2.setFacultyId("F002");
            faculty2.setDepartment("Mathematics");
            faculty2.setDesignation("Assistant Professor");
            faculty2.setOfficeHours("Tuesday, Thursday 1-3 PM");
            faculty2.setCourses(new HashSet<>());
            Faculty savedFaculty2 = facultyRepository.save(faculty2);

            // Create student profiles
            Student student1 = new Student();
            student1.setUser(studentUser1);
            student1.setStudentId("S001");
            student1.setDepartment("Computer Science");
            student1.setSemester(3);
            studentService.saveStudent(student1);

            Student student2 = new Student();
            student2.setUser(studentUser2);
            student2.setStudentId("S002");
            student2.setDepartment("Mathematics");
            student2.setSemester(2);
            studentService.saveStudent(student2);

            // Ensure faculty is properly loaded
            Faculty faculty1FromDb = facultyRepository.findById(savedFaculty1.getId()).orElseThrow();
            Faculty faculty2FromDb = facultyRepository.findById(savedFaculty2.getId()).orElseThrow();

            // Create courses using retrieved faculty
            Course course1 = new Course();
            course1.setCourseCode("CS101");
            course1.setCourseName("Introduction to Programming");
            course1.setDescription("Basic programming concepts using Java");
            course1.setCreditHours(3);
            course1.setSchedule("Monday, Wednesday 9:00-10:30 AM");
            course1.setFaculty(faculty1FromDb);
            courseService.saveCourse(course1);

            Course course2 = new Course();
            course2.setCourseCode("CS201");
            course2.setCourseName("Data Structures");
            course2.setDescription("Advanced data structures and algorithms");
            course2.setCreditHours(4);
            course2.setSchedule("Tuesday, Thursday 10:45-12:15 PM");
            course2.setFaculty(faculty1FromDb);
            courseService.saveCourse(course2);

            Course course3 = new Course();
            course3.setCourseCode("MATH101");
            course3.setCourseName("Calculus I");
            course3.setDescription("Introduction to differential and integral calculus");
            course3.setCreditHours(3);
            course3.setSchedule("Monday, Wednesday 13:00-14:30 PM");
            course3.setFaculty(faculty2FromDb);
            courseService.saveCourse(course3);

            // Manually refresh entities to ensure they have the latest state
            student1 = studentService.getStudentById(student1.getId()).orElse(student1);
            student2 = studentService.getStudentById(student2.getId()).orElse(student2);
            course1 = courseService.getCourseById(course1.getId()).orElse(course1);
            course2 = courseService.getCourseById(course2.getId()).orElse(course2);
            course3 = courseService.getCourseById(course3.getId()).orElse(course3);

            // Enroll students in courses
            studentService.enrollCourse(student1, course1);
            studentService.enrollCourse(student1, course2);
            studentService.enrollCourse(student2, course1);
            studentService.enrollCourse(student2, course3);

            // Create assignments
            Assignment assignment1 = new Assignment();
            assignment1.setTitle("Java Programming Basics");
            assignment1.setDescription("Create a simple calculator application in Java");
            assignment1.setDueDate(LocalDate.now().plusDays(7));
            assignment1.setTotalMarks(100);
            assignment1.setCourse(course1);
            assignmentService.saveAssignment(assignment1);

            Assignment assignment2 = new Assignment();
            assignment2.setTitle("Linked List Implementation");
            assignment2.setDescription("Implement a doubly linked list in Java");
            assignment2.setDueDate(LocalDate.now().plusDays(14));
            assignment2.setTotalMarks(100);
            assignment2.setCourse(course2);
            assignmentService.saveAssignment(assignment2);

            Assignment assignment3 = new Assignment();
            assignment3.setTitle("Derivatives Practice");
            assignment3.setDescription("Solve the given problems on derivatives");
            assignment3.setDueDate(LocalDate.now().plusDays(5));
            assignment3.setTotalMarks(50);
            assignment3.setCourse(course3);
            assignmentService.saveAssignment(assignment3);

            // Create exams
            Exam exam1 = new Exam();
            exam1.setExamTitle("Midterm Exam - CS101");
            exam1.setCourse(course1);
            exam1.setExamDate(LocalDateTime.now().plusDays(30));
            exam1.setExamDuration("2 hours");
            exam1.setLocation("Room 101");
            exam1.setExamType("Midterm");
            exam1.setTotalMarks(100);
            examService.saveExam(exam1);

            Exam exam2 = new Exam();
            exam2.setExamTitle("Midterm Exam - CS201");
            exam2.setCourse(course2);
            exam2.setExamDate(LocalDateTime.now().plusDays(35));
            exam2.setExamDuration("2 hours");
            exam2.setLocation("Room 201");
            exam2.setExamType("Midterm");
            exam2.setTotalMarks(100);
            examService.saveExam(exam2);

            Exam exam3 = new Exam();
            exam3.setExamTitle("Quiz 1 - MATH101");
            exam3.setCourse(course3);
            exam3.setExamDate(LocalDateTime.now().plusDays(10));
            exam3.setExamDuration("30 minutes");
            exam3.setLocation("Room 301");
            exam3.setExamType("Quiz");
            exam3.setTotalMarks(20);
            examService.saveExam(exam3);

            // Create announcements
            Announcement announcement1 = new Announcement();
            announcement1.setTitle("Welcome to CS101");
            announcement1.setContent("Welcome to Introduction to Programming. Please check the syllabus and prepare for the first class.");
            announcement1.setPostDate(LocalDateTime.now().minusDays(2));
            announcement1.setFaculty(faculty1FromDb);
            announcement1.setCourse(course1);
            announcementService.saveAnnouncement(announcement1);

            Announcement announcement2 = new Announcement();
            announcement2.setTitle("Assignment Due Date Extended");
            announcement2.setContent("The due date for the Linked List Implementation assignment has been extended by 3 days.");
            announcement2.setPostDate(LocalDateTime.now().minusDays(1));
            announcement2.setFaculty(faculty1FromDb);
            announcement2.setCourse(course2);
            announcementService.saveAnnouncement(announcement2);

            Announcement announcement3 = new Announcement();
            announcement3.setTitle("Extra Office Hours");
            announcement3.setContent("I will be holding extra office hours this Friday from 2-4 PM to help with the upcoming quiz.");
            announcement3.setPostDate(LocalDateTime.now());
            announcement3.setFaculty(faculty2FromDb);
            announcement3.setCourse(course3);
            announcementService.saveAnnouncement(announcement3);
        } catch (Exception e) {
            System.err.println("Error in DataInitializer: " + e.getMessage());
            e.printStackTrace();
            throw e;  // Rethrow to see in logs
        }
    }
} 