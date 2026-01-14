using TodoTask.Core.Entities;

namespace TodoTask.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Todo> Todos { get; }
    IRepository<SubTask> SubTasks { get; }
    IRepository<Category> Categories { get; }
    IRepository<Reminder> Reminders { get; }
    Task<int> SaveChangesAsync();
}

