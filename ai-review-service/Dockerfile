# eclipse-temurin:21-jre-alpine — JRE-only (not full JDK) on Alpine Linux.
# JRE is sufficient at runtime since compilation happens via Maven at build time.
# Alpine base keeps the image small (~180MB vs ~500MB for full JDK images).
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

COPY target/ai-review-service-1.0.0.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
