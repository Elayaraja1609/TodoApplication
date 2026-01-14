using TodoTask.Application.DTOs;

namespace TodoTask.Application.Services;

public interface IUserPreferencesService
{
    Task<UserPreferencesDto> GetUserPreferencesAsync(int userId);
    Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesRequest request);
}

