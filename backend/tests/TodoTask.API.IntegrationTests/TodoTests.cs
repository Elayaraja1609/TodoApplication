using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace TodoTask.API.IntegrationTests;

public sealed class TodoTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TodoTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Todos_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/v1/todos");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task TodoCrud_WithAuthenticatedUser_Succeeds()
    {
        var token = await RegisterAndLoginAndGetTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createResponse = await _client.PostAsJsonAsync("/api/v1/todos", new
        {
            title = "Integration Todo",
            description = "Created in integration test",
            isImportant = true
        });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var createdTodo = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var todoId = createdTodo.GetProperty("id").GetInt32();

        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/todos/{todoId}", new
        {
            title = "Integration Todo Updated",
            isCompleted = true
        });
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var toggleResponse = await _client.PostAsync($"/api/v1/todos/{todoId}/toggle-complete", null);
        Assert.Equal(HttpStatusCode.OK, toggleResponse.StatusCode);

        var listResponse = await _client.GetAsync("/api/v1/todos");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var listJson = await listResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Array, listJson.ValueKind);

        var deleteResponse = await _client.DeleteAsync($"/api/v1/todos/{todoId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    private async Task<string> RegisterAndLoginAndGetTokenAsync()
    {
        var email = $"todo_{Guid.NewGuid():N}@example.com";
        var password = "Password123!";

        var registerResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            firstName = "Todo",
            lastName = "Tester",
            email,
            password
        });
        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email,
            password
        });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var loginJson = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        return loginJson.GetProperty("token").GetString() ?? throw new InvalidOperationException("Token missing.");
    }
}
