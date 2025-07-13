FROM openjdk:21-jdk-slim

WORKDIR /app

COPY target/notes-backend-*.jar app.jar

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["java", "-jar", "app.jar"]
