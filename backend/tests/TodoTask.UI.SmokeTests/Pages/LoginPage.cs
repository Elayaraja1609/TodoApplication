using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

namespace TodoTask.UI.SmokeTests.Pages;

public sealed class LoginPage
{
    private readonly IWebDriver _driver;
    private readonly WebDriverWait _wait;

    public LoginPage(IWebDriver driver, TimeSpan timeout)
    {
        _driver = driver;
        _wait = new WebDriverWait(driver, timeout);
    }

    public void Open(string baseUrl)
    {
        _driver.Navigate().GoToUrl(baseUrl);
        _wait.Until(ExpectedConditions.ElementExists(By.CssSelector("[data-testid='login-email-input']")));
    }

    public void Login(string email, string password)
    {
        var emailInput = _wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='login-email-input']")));
        var passwordInput = _wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='login-password-input']")));
        var loginButton = _wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='login-submit-button']")));

        emailInput.Clear();
        emailInput.SendKeys(email);

        passwordInput.Clear();
        passwordInput.SendKeys(password);

        loginButton.Click();
    }

    public bool IsLoginFormVisible()
    {
        try
        {
            _wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='login-submit-button']")));
            return true;
        }
        catch (WebDriverTimeoutException)
        {
            return false;
        }
    }
}
