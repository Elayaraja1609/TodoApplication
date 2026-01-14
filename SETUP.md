# Setup Instructions

## Backend Setup

### 1. Prerequisites
- Install .NET 8 SDK from [Microsoft](https://dotnet.microsoft.com/download/dotnet/8.0)
- Install MySQL Server 8.0+ from [MySQL](https://dev.mysql.com/downloads/mysql/)
- Install Visual Studio 2022 or VS Code with C# extension

### 2. Database Setup

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE TodoTaskDB;
   ```

2. **Update Connection String:**
   - Open `backend/TodoTask.API/appsettings.json`
   - Update the `DefaultConnection` string with your MySQL credentials:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=TodoTaskDB;User=root;Password=YOUR_PASSWORD;Port=3306;"
     }
   }
   ```

3. **Update JWT Secret Key:**
   - In the same file, update the JWT SecretKey (should be at least 32 characters):
   ```json
   {
     "JwtSettings": {
       "SecretKey": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!"
     }
   }
   ```

### 3. Run Backend

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Restore packages:**
   ```bash
   dotnet restore
   ```

3. **Run the API:**
   ```bash
   dotnet run --project TodoTask.API
   ```

4. **Verify:**
   - API should start on `https://localhost:5001` or `http://localhost:5000`
   - Open Swagger UI: `https://localhost:5001/swagger`

## Frontend Setup

### 1. Prerequisites
- Install Node.js 18+ from [Node.js](https://nodejs.org/)
- Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```

### 2. Install Dependencies

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install packages:**
   ```bash
   npm install
   ```

### 3. Configure API URL

1. **Open `src/services/api.ts`**
2. **Update the API_BASE_URL:**
   ```typescript
   const API_BASE_URL = __DEV__
     ? 'http://localhost:5000/api/v1'  // Change to your backend URL
     : 'https://your-production-api.com/api/v1';
   ```

   **Note:** For Android emulator, use `http://10.0.2.2:5000` instead of `localhost`
   **Note:** For iOS simulator, use `http://localhost:5000`
   **Note:** For physical device, use your computer's IP address (e.g., `http://192.168.1.100:5000`)

### 4. Run Frontend

1. **Start Expo:**
   ```bash
   npm start
   ```

2. **Choose platform:**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR code with Expo Go app on your phone

## Troubleshooting

### Backend Issues

**Port already in use:**
- Change the port in `launchSettings.json` or kill the process using the port

**Database connection failed:**
- Verify MySQL is running
- Check connection string credentials
- Ensure database exists

**JWT errors:**
- Ensure SecretKey is at least 32 characters
- Check token expiration settings

### Frontend Issues

**Cannot connect to API:**
- Verify backend is running
- Check API_BASE_URL matches your backend URL
- For physical devices, ensure phone and computer are on same network
- Check firewall settings

**Expo errors:**
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall
- Update Expo CLI: `npm install -g expo-cli@latest`

**Notification permissions:**
- Android: Permissions are requested automatically
- iOS: Permissions are requested automatically
- If notifications don't work, check device settings

## Development Tips

1. **Hot Reload:** Both backend and frontend support hot reload
2. **API Testing:** Use Swagger UI for testing API endpoints
3. **Database Migrations:** EF Core will create database automatically on first run
4. **Logs:** Check console for backend logs, Expo console for frontend logs

## Next Steps

1. Create your first user account via Register screen
2. Create categories for organizing tasks
3. Add todos with reminders
4. Test notifications on your device

