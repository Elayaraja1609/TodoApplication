# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file and restore dependencies
COPY TodoTask.sln .
COPY TodoTask.API/TodoTask.API.csproj TodoTask.API/
COPY TodoTask.Application/TodoTask.Application.csproj TodoTask.Application/
COPY TodoTask.Core/TodoTask.Core.csproj TodoTask.Core/
COPY TodoTask.Infrastructure/TodoTask.Infrastructure.csproj TodoTask.Infrastructure/

# Restore NuGet packages
RUN dotnet restore TodoTask.sln

# Copy the rest of the source code
COPY . .

# Build the solution
WORKDIR /src/TodoTask.API
RUN dotnet build "TodoTask.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "TodoTask.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8 runtime image for running
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy published files from the publish stage
COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8080
EXPOSE 8081

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check (optional - remove if health endpoint doesn't exist)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#   CMD curl --fail http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "TodoTask.API.dll"]

