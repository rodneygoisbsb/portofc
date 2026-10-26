# Multi-stage Dockerfile para Spring Boot a partir da raiz
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copia pom.xml e código fonte do backend
COPY backend/pom.xml ./
COPY backend/src ./src

# Compila o JAR de produção sem testes
RUN mvn clean package -DskipTests

# Estágio de Execução com JRE leve
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/portofc-backend-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]
