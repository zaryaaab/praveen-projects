# 🎓 ClubHub - Club Management System

A comprehensive web-based platform for managing student organizations, events, and community engagement. Built with Spring Boot 3.4.5, designed for educational institutions to streamline club operations and enhance student participation.

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-purple.svg)

## 🌟 Overview

ClubHub revolutionizes how educational institutions manage student clubs and organizations. It provides a centralized platform for students to discover clubs, participate in events, and engage with their communities, while giving administrators powerful tools to manage operations efficiently.

### 🎯 Key Benefits
- **For Students**: Easy club discovery, event participation, and community engagement
- **For Club Admins**: Streamlined member management and event organization
- **For Institutions**: Comprehensive oversight and analytics of student activities

---

## 🚀 Quick Start

### Demo Access
Visit the application and use these credentials to explore:

- **System Admin**: `admin@clubbing.com` / `admin123`
- **Student**: `student@clubbing.com` / `student123`

---

## 📋 Prerequisites

### System Requirements
- **Java**: 21 or higher
- **Maven**: 3.6+ (or use included Maven wrapper)
- **Git**: For cloning the repository
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code (recommended)

### Optional (for production)
- **Docker**: 20.10+ and Docker Compose
- **PostgreSQL**: 13+ (for production database)

---

## 🛠️ Local Development Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/clubbing.git
cd clubbing
```

### Step 2: Environment Setup
The application comes pre-configured with H2 in-memory database for development. No additional setup required!

### Step 3: Run the Application

#### Option A: Using Maven Wrapper (Recommended)
```bash
# On Windows
./mvnw.cmd spring-boot:run

# On macOS/Linux
./mvnw spring-boot:run
```

#### Option B: Using System Maven
```bash
mvn spring-boot:run
```

#### Option C: Using IDE
1. Import the project as a Maven project
2. Run `ClubbingApplication.java` as a Java Application

### Step 4: Access the Application
- **Application URL**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:/app/data/clubbing`
  - Username: `sa`
  - Password: `password`

---

## 🐳 Docker Setup

### Quick Start with Docker Compose
```bash
# Clone the repository
git clone https://github.com/your-username/clubbing.git
cd clubbing

# Build and run with Docker Compose
docker-compose up --build
```

### Manual Docker Build
```bash
# Build the application
./mvnw clean package

# Build Docker image
docker build -t clubbing-app .

# Run the container
docker run -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  clubbing-app
```

### Docker Compose Configuration
The included `docker-compose.yml` provides:
- Spring Boot application container
- Persistent volume for H2 database
- Port mapping (8080:8080)
- Environment variable configuration

---

## 🗄️ Database Configuration

### Development (H2 Database)
The application uses H2 in-memory database by default:
```properties
spring.datasource.url=jdbc:h2:file:/app/data/clubbing
spring.datasource.username=sa
spring.datasource.password=password
```

### Production (PostgreSQL)
For production deployment, update `application.properties`:
```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/clubbing
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Add PostgreSQL dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## ⚙️ Configuration

### Application Properties
Key configuration options in `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:h2:file:/app/data/clubbing
spring.datasource.username=sa
spring.datasource.password=password

# Security Configuration
spring.security.remember-me.key=clubbing-remember-me-key

# Logging Configuration
logging.level.org.springframework.security=DEBUG
logging.level.com.clubbing=DEBUG
```

### Environment Variables
Override configuration using environment variables:
```bash
export SERVER_PORT=8080
export DATABASE_URL=jdbc:h2:file:/app/data/clubbing
export DATABASE_USERNAME=sa
export DATABASE_PASSWORD=password
```

---

## 🧪 Testing

### Run All Tests
```bash
./mvnw test
```

### Run Specific Test Classes
```bash
./mvnw test -Dtest=UserServiceTest
```

### Test Coverage
```bash
./mvnw jacoco:report
```

### Integration Tests
```bash
./mvnw verify
```

---

## 📦 Building for Production

### Create JAR File
```bash
./mvnw clean package
```
Generated JAR: `target/clubbing-0.0.1-SNAPSHOT.jar`

### Run Production JAR
```bash
java -jar target/clubbing-0.0.1-SNAPSHOT.jar
```

### Production Build with Docker
```bash
# Multi-stage Docker build for production
docker build -t clubbing-prod -f Dockerfile.prod .
```

---

## 🔧 Development Tools

### IDE Setup

#### IntelliJ IDEA
1. Import as Maven project
2. Enable annotation processing for Lombok
3. Install Lombok plugin
4. Set Java SDK to 21

#### VS Code
1. Install Extension Pack for Java
2. Install Spring Boot Extension Pack
3. Install Lombok Annotations Support

### Code Quality Tools
```bash
# Code formatting
./mvnw spring-javaformat:apply

# Static analysis
./mvnw spotbugs:check

# Dependency check
./mvnw dependency-check:check
```

---

## 🚀 Deployment

### Local Development Server
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Staging Environment
```bash
java -jar clubbing.jar --spring.profiles.active=staging
```

### Production Deployment
```bash
java -jar clubbing.jar --spring.profiles.active=production
```

### Docker Production Deployment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: clubbing-app:latest
    ports:
      - "80:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=production
      - DATABASE_URL=jdbc:postgresql://db:5432/clubbing
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=clubbing
      - POSTGRES_USER=clubbing
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📊 Monitoring & Observability

### Health Checks
- **Health Endpoint**: http://localhost:8080/actuator/health
- **Metrics**: http://localhost:8080/actuator/metrics
- **Info**: http://localhost:8080/actuator/info

### Logging
```bash
# View application logs
tail -f logs/clubbing.log

# Docker logs
docker logs -f clubbing-container
```

### Performance Monitoring
Enable Actuator endpoints in `application.properties`:
```properties
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=always
```

---

## 🔒 Security

### Security Features
- **Authentication**: Session-based with Spring Security
- **Authorization**: Role-based access control (RBAC)
- **Password Security**: BCrypt encryption
- **CSRF Protection**: Enabled for all forms
- **Session Management**: Secure session handling

### Security Headers
The application includes security headers:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or change port
./mvnw spring-boot:run -Dserver.port=8081
```

#### Database Connection Issues
```bash
# Check H2 database file permissions
ls -la data/clubbing.mv.db

# Reset database
rm -rf data/clubbing.*
```

#### Out of Memory
```bash
# Increase JVM memory
export MAVEN_OPTS="-Xmx1024m"
./mvnw spring-boot:run
```

### Log Locations
- **Application Logs**: `logs/clubbing.log`
- **Access Logs**: `logs/access.log`
- **Error Logs**: `logs/error.log`

---

## 📚 API Documentation

### Available Endpoints
- **Homepage**: `GET /`
- **Authentication**: `POST /login`, `POST /logout`
- **Registration**: `GET /register`, `POST /register`
- **Dashboard**: `GET /dashboard`
- **Profile Management**: `GET /profile`, `POST /profile/update`
- **Admin Panel**: `GET /admin/**` (Admin only)

### Future API Development
RESTful API endpoints will be added in future versions for:
- Club management
- Event management
- Member management
- Notification system

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow Java naming conventions
- Use meaningful commit messages
- Add tests for new features
- Update documentation

### Testing Guidelines
- Write unit tests for service layers
- Add integration tests for controllers
- Maintain test coverage above 80%

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Getting Help
- **Documentation**: Check [FEATURES.md](FEATURES.md) for detailed feature information
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

### Contact
- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Documentation**: [Wiki](https://github.com/your-username/clubbing/wiki)

---

## 🗺️ Roadmap

### Current Version: 1.0.0
- ✅ User Management System
- ✅ Authentication & Authorization
- ✅ Profile Management
- ✅ Admin Dashboard

### Version 1.1.0 (Next Release)
- 🔄 Club Management System
- 🔄 Club Creation & Administration
- 🔄 Club Discovery

### Version 1.2.0
- 🔮 Membership Management
- 🔮 Join Requests & Approvals
- 🔮 Member Directory

### Version 2.0.0
- 🔮 Event Management System
- 🔮 Forum & Discussions
- 🔮 Notification System

---

## ⭐ Acknowledgments

- **Spring Boot Team** for the excellent framework
- **Bootstrap Team** for the responsive UI framework
- **Font Awesome** for the beautiful icons
- **H2 Database** for the embedded database solution

---

*Made with ❤️ for student communities*

**Last Updated**: December 2024  
**Version**: 1.0.0 