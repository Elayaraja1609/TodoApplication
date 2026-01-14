# Todo Task - Full-Stack Todo & Reminder Application

A production-ready, full-stack Todo & Reminder application with alarm notifications, built with ASP.NET Core 8 Web API and React Native (Expo).

## 🏗️ Architecture

### Backend
- **ASP.NET Core 8 Web API** with Clean Architecture
- **MySQL** database with Entity Framework Core
- **JWT** authentication & authorization
- **RESTful API** with Swagger documentation

### Frontend
- **React Native** with Expo
- **TypeScript** for type safety
- **Offline-first** with local storage
- **Native notifications** for reminders
- Cross-platform support (Android, iOS, Web)

## 📁 Project Structure

```
Todo Task/
├── backend/
│   ├── TodoTask.API/          # Web API layer
│   ├── TodoTask.Application/  # Business logic & DTOs
│   ├── TodoTask.Core/         # Domain entities & interfaces
│   └── TodoTask.Infrastructure/ # Data access & external services
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/          # React contexts (Auth, etc.)
    │   ├── screens/           # Screen components
    │   ├── services/          # API & storage services
    │   └── types/             # TypeScript types
    └── App.tsx                # Main app entry
```

## 🚀 Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm/yarn
- MySQL Server 8.0+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Update database connection string** in `TodoTask.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=TodoTaskDB;User=root;Password=yourpassword;Port=3306;"
     }
   }
   ```

3. **Update JWT Secret Key** in `appsettings.json`:
   ```json
   {
     "JwtSettings": {
       "SecretKey": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!"
     }
   }
   ```

4. **Restore packages and run:**
   ```bash
   dotnet restore
   dotnet run --project TodoTask.API
   ```

5. **Access Swagger UI:**
   - Navigate to `https://localhost:5001/swagger` (or the port shown in console)

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API base URL** in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://localhost:5000/api/v1'  // Update with your backend URL
     : 'https://your-production-api.com/api/v1';
   ```

4. **Start Expo:**
   ```bash
   npm start
   ```

5. **Run on device/emulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web

## 🔐 Authentication

The app uses JWT-based authentication:

1. **Register:** `POST /api/v1/auth/register`
2. **Login:** `POST /api/v1/auth/login`
3. **Refresh Token:** `POST /api/v1/auth/refresh`

Tokens are stored securely using Expo SecureStore.

## 📱 Features

### Todos
- Create, read, update, delete todos
- Mark as complete/incomplete
- Add subtasks
- Set due dates and execution times
- Recurrence patterns (daily, weekly, monthly)
- Category assignment
- Priority/importance flag

### Categories
- Create custom categories
- Color and icon customization
- Category-based filtering

### Reminders
- Schedule reminders with notifications
- Recurring reminders
- Snooze functionality
- Native notifications (works when app is closed)

### Offline Support
- Local storage for todos, categories, and reminders
- Automatic sync when online
- Conflict resolution

## 🔔 Notifications

The app uses Expo Notifications for native alarm notifications:

- **Android:** Requires notification permissions
- **iOS:** Requires notification permissions
- Works in background and when app is closed
- Supports recurring reminders

## 🗄️ Database Schema

### Users
- Id, Email, PasswordHash, FirstName, LastName, Role
- Soft delete support

### Todos
- Id, UserId, Title, Description, CategoryId
- IsCompleted, IsImportant
- StartDate, DueDate, ExecutionTime
- RecurrencePattern, NextOccurrence
- Soft delete support

### Categories
- Id, UserId, Name, Color, Icon
- Soft delete support

### Reminders
- Id, UserId, TodoId, Title, Description
- ReminderTime, IsCompleted, IsSnoozed
- RecurrencePattern, NextReminderTime
- Soft delete support

## 🧪 Testing

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Production Deployment

### Backend
1. Update `appsettings.json` with production connection string
2. Set environment variables for sensitive data
3. Deploy to Azure App Service, AWS, or your preferred hosting

### Frontend
1. Update API base URL in `src/services/api.ts`
2. Build for production:
   ```bash
   expo build:android
   expo build:ios
   ```

## 🔒 Security

- Passwords are hashed using BCrypt
- JWT tokens with expiration
- Secure token storage (Expo SecureStore)
- Input validation
- SQL injection protection (EF Core)
- CORS configuration

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Todos
- `GET /api/v1/todos` - Get all user todos
- `GET /api/v1/todos/{id}` - Get todo by ID
- `POST /api/v1/todos` - Create todo
- `PUT /api/v1/todos/{id}` - Update todo
- `DELETE /api/v1/todos/{id}` - Delete todo
- `POST /api/v1/todos/{id}/toggle-complete` - Toggle completion

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/{id}` - Get category by ID
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

### Reminders
- `GET /api/v1/reminders` - Get all reminders
- `GET /api/v1/reminders/{id}` - Get reminder by ID
- `POST /api/v1/reminders` - Create reminder
- `PUT /api/v1/reminders/{id}` - Update reminder
- `DELETE /api/v1/reminders/{id}` - Delete reminder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.

