FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src

# Create data directory and set permissions
RUN mkdir -p /app/data && chmod 777 /app/data

CMD ["./mvnw", "spring-boot:run"]

EXPOSE 3800
