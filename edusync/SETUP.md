# EduSync Setup Guide

This guide will help you set up the EduSync project in your development environment. The project is built with Spring Boot 3.4.5 and requires Java 21.

## Prerequisites

- Java 21 (JDK)
- Maven 3.8.x or later
- Docker and Docker Compose (for containerized setup)
- Git

## Initial Credentials

The application comes with pre-configured test accounts for different user roles. You can use these credentials to explore the system:

### Admin Account
- Username: `admin`
- Password: `admin123`
- Email: admin@edusync.com

### Faculty Accounts
1. First Faculty
   - Username: `professor1`
   - Password: `faculty123`
   - Email: john.smith@edusync.com

2. Second Faculty
   - Username: `professor2`
   - Password: `faculty123`
   - Email: emily.johnson@edusync.com

### Student Accounts
1. First Student
   - Username: `student1`
   - Password: `student123`
   - Email: alice.brown@edusync.com

2. Second Student
   - Username: `student2`
   - Password: `student123`
   - Email: bob.wilson@edusync.com

These accounts are automatically created when you first run the application. Each account has different permissions and access levels based on their role.

## IDE Setup

### IntelliJ IDEA

1. **Install IntelliJ IDEA**
   - Download and install IntelliJ IDEA Ultimate or Community Edition
   - Recommended version: 2023.3 or later

2. **Project Setup**
   - Clone the repository
   - Open IntelliJ IDEA
   - Select "Open" and choose the project directory
   - Wait for IntelliJ to index the project and download dependencies
   - Enable annotation processing:
     - Go to Settings/Preferences
     - Navigate to Build, Execution, Deployment > Compiler > Annotation Processors
     - Enable "Enable annotation processing"

3. **Run Configuration**
   - Click on "Add Configuration" in the top toolbar
   - Click "+" and select "Spring Boot"
   - Set the main class to `com.edusync.EdusyncApplication`
   - Set the working directory to the project root
   - Click "Apply" and "OK"

### VS Code

1. **Install VS Code**
   - Download and install VS Code from https://code.visualstudio.com/
   - Install the following extensions:
     - Extension Pack for Java
     - Spring Boot Extension Pack
     - Lombok Annotations Support

2. **Project Setup**
   - Clone the repository
   - Open VS Code
   - Open the project folder
   - Wait for VS Code to download dependencies and index the project
   - If prompted, install recommended extensions

3. **Run Configuration**
   - Open the project in VS Code
   - Navigate to the Run and Debug view (Ctrl+Shift+D)
   - Click "create a launch.json file"
   - Select "Java"
   - The configuration will be automatically created

## Docker Setup

1. **Install Docker**
   - Install Docker Desktop for your operating system
   - Ensure Docker Compose is installed (included with Docker Desktop)

2. **Build and Run with Docker**
   ```bash
   # Build and start the containers
   docker-compose up --build

   # To run in detached mode
   docker-compose up -d

   # To stop the containers
   docker-compose down
   ```

3. **Access the Application**
   - The application will be available at http://localhost:8080

## Manual Setup (Without Docker)

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd edusync
   ```

2. **Build the Project**
   ```bash
   # Using Maven wrapper
   ./mvnw clean install

   # Or using Maven directly
   mvn clean install
   ```

3. **Run the Application**
   ```bash
   # Using Maven wrapper
   ./mvnw spring-boot:run

   # Or using Maven directly
   mvn spring-boot:run
   ```

## Environment Variables

The following environment variables can be configured:

- `SPRING_PROFILES_ACTIVE`: Set to `dev` for development environment
- `SERVER_PORT`: Default is 8080

## Troubleshooting

1. **Port Conflicts**
   - If port 8080 is already in use, you can change it in `application.properties` or using the `SERVER_PORT` environment variable

2. **Docker Issues**
   - Ensure Docker daemon is running
   - Check Docker logs: `docker-compose logs`
   - Verify port mappings in docker-compose.yml

3. **Build Issues**
   - Clean Maven cache: `./mvnw clean`
   - Delete target directory: `rm -rf target/`
   - Update Maven dependencies: `./mvnw dependency:purge-local-repository`

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Docker Documentation](https://docs.docker.com/)
- [Maven Documentation](https://maven.apache.org/guides/) 