using OpenQA.Selenium;
using TodoTask.UI.SmokeTests.Drivers;
using TodoTask.UI.SmokeTests.Pages;
using Xunit;

namespace TodoTask.UI.SmokeTests.Tests;

public sealed class LoginSmokeTests : IDisposable
{
    private readonly IWebDriver _driver;
    private readonly string _baseUrl;

    public LoginSmokeTests()
    {
        _baseUrl = Environment.GetEnvironmentVariable("TEST_BASE_URL") ?? "http://localhost:8081";
        _driver = WebDriverFactory.Create();
    }

    [Fact]
    public void LoginPage_Loads_And_ShowsForm()
    {
        var loginPage = new LoginPage(_driver, TimeSpan.FromSeconds(20));
        loginPage.Open(_baseUrl);

        Assert.True(loginPage.IsLoginFormVisible());
    }

    [Fact]
    public void Login_WithInvalidCredentials_StaysOnLoginPage()
    {
        var loginPage = new LoginPage(_driver, TimeSpan.FromSeconds(20));
        loginPage.Open(_baseUrl);

        loginPage.Login("notfound@example.com", "wrong-password");

        Assert.True(loginPage.IsLoginFormVisible());
    }

    public void Dispose()
    {
        _driver.Quit();
        _driver.Dispose();
    }
}
