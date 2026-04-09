using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace TodoTask.API.IntegrationTests;

public sealed class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_Then_Login_ReturnsTokens()
    {
        var email = $"user_{Guid.NewGuid():N}@example.com";
        var registerPayload = new
        {
            firstName = "Smoke",
            lastName = "User",
            email,
            password = "Password123!"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", registerPayload);
        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        var registerJson = await registerResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(registerJson.TryGetProperty("token", out var registerToken));
        Assert.False(string.IsNullOrWhiteSpace(registerToken.GetString()));

        var loginPayload = new
        {
            email,
            password = "Password123!"
        };

        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", loginPayload);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginJson = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(loginJson.TryGetProperty("token", out var loginToken));
        Assert.True(loginJson.TryGetProperty("refreshToken", out var refreshToken));
        Assert.False(string.IsNullOrWhiteSpace(loginToken.GetString()));
        Assert.False(string.IsNullOrWhiteSpace(refreshToken.GetString()));
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        var email = $"invalid_{Guid.NewGuid():N}@example.com";

        await _client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            firstName = "Invalid",
            lastName = "Case",
            email,
            password = "Password123!"
        });

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email,
            password = "WrongPassword!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
