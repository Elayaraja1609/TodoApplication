# =========================
# BUILD STAGE
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files from backend
COPY backend/TodoTask.sln .

COPY backend/TodoTask.API/TodoTask.API.csproj TodoTask.API/
COPY backend/TodoTask.Application/TodoTask.Application.csproj TodoTask.Application/
COPY backend/TodoTask.Core/TodoTask.Core.csproj TodoTask.Core/
COPY backend/TodoTask.Infrastructure/TodoTask.Infrastructure.csproj TodoTask.Infrastructure/

# Restore dependencies
RUN dotnet restore TodoTask.sln

# Copy remaining backend source code
COPY backend/. .

# Build API project
WORKDIR /src/TodoTask.API
RUN dotnet build "TodoTask.API.csproj" -c Release -o /app/build

# =========================
# PUBLISH STAGE
# =========================
FROM build AS publish
RUN dotnet publish "TodoTask.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy published output
COPY --from=publish /app/publish .

# Permissions
RUN chown -R appuser:appuser /app
USER appuser

# Railway uses 8080
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Start API
ENTRYPOINT ["dotnet", "TodoTask.API.dll"]
