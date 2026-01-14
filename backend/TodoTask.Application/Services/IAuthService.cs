using TodoTask.Application.DTOs.Auth;

namespace TodoTask.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string token, string refreshToken);
    Task SetupPinAsync(int userId, SetupPinRequest request);
    Task<bool> VerifyPinAsync(int userId, VerifyPinRequest request);
    Task ChangePinAsync(int userId, ChangePinRequest request);
    Task<bool> HasPinAsync(int userId);
}

