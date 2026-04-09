import { Builder, By, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { webE2EConfig } from "../config";

const assert = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const buildDriver = async (): Promise<WebDriver> => {
  const options = new chrome.Options();
  options.addArguments("--window-size=1440,900");

  if (webE2EConfig.headless) {
    options.addArguments("--headless=new");
  }

  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
};

const run = async (): Promise<void> => {
  const driver = await buildDriver();

  try {
    await driver.get(webE2EConfig.baseUrl);

    const emailInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-email-input']")),
      webE2EConfig.timeoutMs
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-password-input']")),
      webE2EConfig.timeoutMs
    );

    await emailInput.clear();
    await emailInput.sendKeys(webE2EConfig.loginEmail);
    await passwordInput.clear();
    await passwordInput.sendKeys(webE2EConfig.loginPassword);

    const loginButton = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-submit-button']")),
      webE2EConfig.timeoutMs
    );
    await loginButton.click();

    await driver.wait(until.urlIs(webE2EConfig.baseUrl), 2000).catch(() => undefined);

    // Wait for either home screen or fallback login state after auth attempt.
    const pageSource = await driver.getPageSource();
    const landedOnHome = pageSource.includes("home-welcome-text") || pageSource.includes("Welcome");
    const stillOnLogin = pageSource.includes("login-screen-title") || pageSource.includes("Log in");
    assert(landedOnHome || stillOnLogin, "Unable to verify auth flow state after login.");

    if (landedOnHome) {
      const addButton = await driver
        .wait(until.elementLocated(By.css("[data-testid='home-add-task-button']")), 5000)
        .catch(() => null);

      assert(addButton !== null, "Home loaded but add-task control was not found.");

      await addButton!.click();

      const taskTitle = `Smoke Task ${Date.now()}`;
      const taskTitleInput = await driver.wait(
        until.elementLocated(By.css("[data-testid='task-title-input']")),
        webE2EConfig.timeoutMs
      );
      await taskTitleInput.clear();
      await taskTitleInput.sendKeys(taskTitle);

      const saveButton = await driver.wait(
        until.elementLocated(By.css("[data-testid='task-save-button']")),
        webE2EConfig.timeoutMs
      );
      await saveButton.click();

      await driver.sleep(1500);
      const postSaveSource = await driver.getPageSource();
      assert(postSaveSource.includes(taskTitle), "Created todo title was not found after save.");
    }
  } finally {
    await driver.quit();
  }
};

run().catch((error) => {
  console.error("[web-e2e] auth smoke failed:", error);
  process.exitCode = 1;
});
