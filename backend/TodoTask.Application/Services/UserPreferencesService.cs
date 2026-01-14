using TodoTask.Application.DTOs;
using TodoTask.Core.Interfaces;

namespace TodoTask.Application.Services;

public class UserPreferencesService : IUserPreferencesService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserPreferencesService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<UserPreferencesDto> GetUserPreferencesAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found");
        }

        return new UserPreferencesDto
        {
            AutoTransferOverdueTasks = user.AutoTransferOverdueTasks,
            DefaultTaskDate = user.DefaultTaskDate ?? "none",
            FirstDayOfWeek = user.FirstDayOfWeek ?? "default",
            EnableNotificationReminders = user.EnableNotificationReminders,
            Theme = user.Theme ?? "default",
        };
    }

    public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found");
        }

        user.AutoTransferOverdueTasks = request.AutoTransferOverdueTasks;
        user.DefaultTaskDate = request.DefaultTaskDate ?? "none";
        user.FirstDayOfWeek = request.FirstDayOfWeek ?? "default";
        user.EnableNotificationReminders = request.EnableNotificationReminders;
        user.Theme = request.Theme ?? "default";
        user.UpdatedAt = DateTime.UtcNow;
        
        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return new UserPreferencesDto
        {
            AutoTransferOverdueTasks = user.AutoTransferOverdueTasks,
            DefaultTaskDate = user.DefaultTaskDate ?? "none",
            FirstDayOfWeek = user.FirstDayOfWeek ?? "default",
            EnableNotificationReminders = user.EnableNotificationReminders,
            Theme = user.Theme ?? "default",
        };
    }
}

