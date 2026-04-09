using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace TodoTask.UI.SmokeTests.Drivers;

public static class WebDriverFactory
{
    public static IWebDriver Create()
    {
        var browser = Environment.GetEnvironmentVariable("SELENIUM_BROWSER") ?? "chrome";
        var isHeadless = (Environment.GetEnvironmentVariable("SELENIUM_HEADLESS") ?? "true")
            .Equals("true", StringComparison.OrdinalIgnoreCase);

        if (!browser.Equals("chrome", StringComparison.OrdinalIgnoreCase))
        {
            throw new NotSupportedException($"Browser '{browser}' is not supported. Use 'chrome'.");
        }

        var options = new ChromeOptions();
        options.AddArgument("--window-size=1440,900");
        options.AddArgument("--disable-gpu");
        options.AddArgument("--no-sandbox");

        if (isHeadless)
        {
            options.AddArgument("--headless=new");
        }

        return new ChromeDriver(options);
    }
}
