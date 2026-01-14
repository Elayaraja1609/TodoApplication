using TodoTask.Core.Entities;
using TodoTask.Core.Interfaces;
using TodoTask.Infrastructure.Data;

namespace TodoTask.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IRepository<User>? _users;
    private IRepository<Todo>? _todos;
    private IRepository<SubTask>? _subTasks;
    private IRepository<Category>? _categories;
    private IRepository<Reminder>? _reminders;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);
    public IRepository<Todo> Todos => _todos ??= new Repository<Todo>(_context);
    public IRepository<SubTask> SubTasks => _subTasks ??= new Repository<SubTask>(_context);
    public IRepository<Category> Categories => _categories ??= new Repository<Category>(_context);
    public IRepository<Reminder> Reminders => _reminders ??= new Repository<Reminder>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

