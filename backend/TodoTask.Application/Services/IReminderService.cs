using TodoTask.Application.DTOs.Reminder;

namespace TodoTask.Application.Services;

public interface IReminderService
{
    Task<IEnumerable<ReminderDto>> GetUserRemindersAsync(int userId);
    Task<ReminderDto?> GetReminderByIdAsync(int id, int userId);
    Task<ReminderDto> CreateReminderAsync(CreateReminderRequest request, int userId);
    Task<ReminderDto> UpdateReminderAsync(int id, UpdateReminderRequest request, int userId);
    Task DeleteReminderAsync(int id, int userId);
}

