package com.edusync.edusync;

import com.edusync.edusync.service.DataInitializerService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EdusyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(EdusyncApplication.class, args);
	}

	/**
	 * Initialize timetable data for all students on application startup
	 */
	@Bean
	CommandLineRunner initData(DataInitializerService dataInitializerService) {
		return args -> {
			try {
				// Initialize course schedule data for all students
				dataInitializerService.initializeAllStudentSchedules();
				System.out.println("Course schedule data initialized successfully");
			} catch (Exception e) {
				System.err.println("Error initializing schedule data: " + e.getMessage());
				e.printStackTrace();
			}
		};
	}

}
