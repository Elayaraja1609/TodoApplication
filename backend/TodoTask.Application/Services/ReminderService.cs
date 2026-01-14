using TodoTask.Application.DTOs.Reminder;
using TodoTask.Core.Entities;
using TodoTask.Core.Interfaces;

namespace TodoTask.Application.Services;

public class ReminderService : IReminderService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReminderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ReminderDto>> GetUserRemindersAsync(int userId)
    {
        var reminders = await _unitOfWork.Reminders.FindAsync(r => r.UserId == userId && !r.IsDeleted);
        return reminders.Select(MapToDto);
    }

    public async Task<ReminderDto?> GetReminderByIdAsync(int id, int userId)
    {
        var reminders = await _unitOfWork.Reminders.FindAsync(r => r.Id == id && r.UserId == userId && !r.IsDeleted);
        var reminder = reminders.FirstOrDefault();
        return reminder != null ? MapToDto(reminder) : null;
    }

    public async Task<ReminderDto> CreateReminderAsync(CreateReminderRequest request, int userId)
    {
        var reminder = new Reminder
        {
            UserId = userId,
            TodoId = request.TodoId,
            Title = request.Title,
            Description = request.Description,
            ReminderTime = request.ReminderTime,
            RecurrencePattern = request.RecurrencePattern,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Calculate next reminder time if recurrence is set
        if (!string.IsNullOrEmpty(request.RecurrencePattern))
        {
            reminder.NextReminderTime = CalculateNextReminderTime(request.RecurrencePattern, request.ReminderTime);
        }

        await _unitOfWork.Reminders.AddAsync(reminder);
        await _unitOfWork.SaveChangesAsync();

        var createdReminder = await _unitOfWork.Reminders.GetByIdAsync(reminder.Id);
        return MapToDto(createdReminder!);
    }

    public async Task<ReminderDto> UpdateReminderAsync(int id, UpdateReminderRequest request, int userId)
    {
        var reminders = await _unitOfWork.Reminders.FindAsync(r => r.Id == id && r.UserId == userId && !r.IsDeleted);
        var reminder = reminders.FirstOrDefault() ?? throw new KeyNotFoundException("Reminder not found");

        if (request.Title != null) reminder.Title = request.Title;
        if (request.Description != null) reminder.Description = request.Description;
        if (request.ReminderTime.HasValue) reminder.ReminderTime = request.ReminderTime.Value;
        if (request.IsCompleted.HasValue) reminder.IsCompleted = request.IsCompleted.Value;
        if (request.IsSnoozed.HasValue) reminder.IsSnoozed = request.IsSnoozed.Value;
        if (request.SnoozeUntil.HasValue) reminder.SnoozeUntil = request.SnoozeUntil;
        if (request.RecurrencePattern != null) reminder.RecurrencePattern = request.RecurrencePattern;

        reminder.UpdatedAt = DateTime.UtcNow;

        // Recalculate next reminder time if recurrence changed
        if (request.RecurrencePattern != null && !string.IsNullOrEmpty(reminder.RecurrencePattern))
        {
            reminder.NextReminderTime = CalculateNextReminderTime(reminder.RecurrencePattern, reminder.ReminderTime);
        }

        await _unitOfWork.Reminders.UpdateAsync(reminder);
        await _unitOfWork.SaveChangesAsync();

        var updatedReminder = await _unitOfWork.Reminders.GetByIdAsync(reminder.Id);
        return MapToDto(updatedReminder!);
    }

    public async Task DeleteReminderAsync(int id, int userId)
    {
        var reminders = await _unitOfWork.Reminders.FindAsync(r => r.Id == id && r.UserId == userId && !r.IsDeleted);
        var reminder = reminders.FirstOrDefault() ?? throw new KeyNotFoundException("Reminder not found");

        reminder.IsDeleted = true;
        reminder.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Reminders.UpdateAsync(reminder);
        await _unitOfWork.SaveChangesAsync();
    }

    private ReminderDto MapToDto(Reminder reminder)
    {
        return new ReminderDto
        {
            Id = reminder.Id,
            TodoId = reminder.TodoId,
            TodoTitle = reminder.Todo?.Title,
            Title = reminder.Title,
            Description = reminder.Description,
            ReminderTime = reminder.ReminderTime,
            IsCompleted = reminder.IsCompleted,
            IsSnoozed = reminder.IsSnoozed,
            SnoozeUntil = reminder.SnoozeUntil,
            RecurrencePattern = reminder.RecurrencePattern,
            NextReminderTime = reminder.NextReminderTime,
            CreatedAt = reminder.CreatedAt,
            UpdatedAt = reminder.UpdatedAt
        };
    }

    private DateTime? CalculateNextReminderTime(string pattern, DateTime reminderTime)
    {
        return pattern.ToLower() switch
        {
            "daily" => reminderTime.AddDays(1),
            "weekly" => reminderTime.AddDays(7),
            "monthly" => reminderTime.AddMonths(1),
            _ => null
        };
    }
}

