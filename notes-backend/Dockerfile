# ================================
# Multi-stage Docker Build
# ================================

# Stage 1: Build Stage
FROM maven:3.9.6-openjdk-21-slim AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies (for better layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime Stage
FROM openjdk:21-jdk-slim AS runtime

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Create application user (security best practice)
RUN groupadd -r notesapp && useradd -r -g notesapp notesapp

# Set working directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Create logs directory
RUN mkdir -p /var/log/notes-backend && chown notesapp:notesapp /var/log/notes-backend

# Copy health check script
COPY docker/healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh

# Change ownership of application files
RUN chown -R notesapp:notesapp /app

# Switch to non-root user
USER notesapp

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/healthcheck.sh

# JVM arguments for production
ENV JAVA_OPTS="-server \
    -Xms512m \
    -Xmx1024m \
    -XX:+UseG1GC \
    -XX:MaxGCPauseMillis=200 \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -XX:+UseCompressedOops \
    -XX:+UseCompressedClassPointers \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=prod"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
