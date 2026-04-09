export interface WebE2EConfig {
  baseUrl: string;
  loginEmail: string;
  loginPassword: string;
  timeoutMs: number;
  headless: boolean;
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

export const webE2EConfig: WebE2EConfig = {
  baseUrl: process.env.WEB_E2E_BASE_URL ?? "http://localhost:8081",
  loginEmail: process.env.WEB_E2E_EMAIL ?? "smoke.user@example.com",
  loginPassword: process.env.WEB_E2E_PASSWORD ?? "Password123!",
  timeoutMs: Number(process.env.WEB_E2E_TIMEOUT_MS ?? "20000"),
  headless: parseBoolean(process.env.WEB_E2E_HEADLESS, true),
};
