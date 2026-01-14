using Microsoft.EntityFrameworkCore;
using TodoTask.Core.Entities;

namespace TodoTask.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Todo> Todos { get; set; }
    public DbSet<SubTask> SubTasks { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Reminder> Reminders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(50).HasDefaultValue("User");
        });

        // Todo configuration
        modelBuilder.Entity<Todo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CategoryId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Todos)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Category)
                .WithMany(c => c.Todos)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // SubTask configuration
        modelBuilder.Entity<SubTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TodoId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.Todo)
                .WithMany(t => t.SubTasks)
                .HasForeignKey(e => e.TodoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(20).HasDefaultValue("#6366f1");
            entity.Property(e => e.Icon).HasMaxLength(50).HasDefaultValue("home");
            entity.HasOne(e => e.User)
                .WithMany(u => u.Categories)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Reminder configuration
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TodoId);
            entity.HasIndex(e => e.ReminderTime);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.HasOne(e => e.User)
                .WithMany(u => u.Reminders)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Todo)
                .WithMany(t => t.Reminders)
                .HasForeignKey(e => e.TodoId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}

