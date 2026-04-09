describe("Mobile Auth Smoke", () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it("shows login form and allows typing credentials", async () => {
    await expect(element(by.id("login-screen-title"))).toBeVisible();
    await element(by.id("login-email-input")).tap();
    await element(by.id("login-email-input")).replaceText("smoke.user@example.com");
    await element(by.id("login-password-input")).tap();
    await element(by.id("login-password-input")).replaceText("Password123!");
    await expect(element(by.id("login-submit-button"))).toBeVisible();
  });
});
