FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
RUN apt-get update -q && apt-get install -y -q maven && rm -rf /var/lib/apt/lists/*
COPY pom.xml .
COPY src ./src
RUN mvn generate-sources --batch-mode -q && mvn package -DskipTests --batch-mode -q

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/target/scholar-service-1.0.0.jar app.jar
EXPOSE 8081 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
