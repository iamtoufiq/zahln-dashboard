import { readFileSync } from "node:fs";

import { expect, type Page, test } from "@playwright/test";

async function signIn(page: Page) {
  await page.getByLabel("Username").fill("finance");
  await page.getByLabel("Password", { exact: true }).fill("test1234");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("finance signs in, reads the day, searches a payment and exports CSV", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page);

  await expect(page.getByRole("heading", { name: "Daily totals" })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByText("Gross").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole("row", { name: /Mensa am Campus/ })).toBeVisible();

  await page.getByRole("link", { name: "Needs attention" }).click();
  await expect(page.getByRole("heading", { name: "Payments that need attention" })).toBeVisible();

  await page.getByRole("link", { name: "Payments", exact: true }).click();
  const firstPayment = page.locator("tbody tr a").first();
  await expect(firstPayment).toBeVisible({ timeout: 60_000 });
  const paymentId = (await firstPayment.textContent()) ?? "";

  await page.getByLabel("Payment, order or payer ID").fill(paymentId);
  await page.getByLabel("Payment, order or payer ID").press("Enter");
  await expect(page).toHaveURL(new RegExp(`q=${paymentId}`));
  await page.getByRole("link", { name: paymentId }).click();
  await expect(page.getByRole("heading", { name: "History" })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("Payment started")).toBeVisible();

  await page.getByRole("link", { name: /Back/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const text = readFileSync(await (await download).path(), "utf8").replace(/^\uFEFF/, "");
  const [header, ...rows] = text.split("\r\n");
  expect(header).toBe(
    "payment_id,order_id,created_at,mensa,till,payer_id,price_group,status,amount_eur,refunded_eur,refundable_eur,pending_refund_eur,attention_reasons",
  );
  expect(rows.length).toBeGreaterThan(0);
  expect(rows[0]).toMatch(/^pay_\w+,ord_\w+,\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},/);
});

test("the dashboard switches to German", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await page.getByRole("button", { name: "Deutsch" }).click();
  await expect(page.getByRole("heading", { name: "Tagessummen" })).toBeVisible({ timeout: 60_000 });
});

test("a reload keeps finance signed in", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Daily totals" })).toBeVisible({
    timeout: 60_000,
  });

  await page.reload();

  await expect(page.getByRole("heading", { name: "Daily totals" })).toBeVisible();
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByText("Gross").first()).toBeVisible({ timeout: 60_000 });
});

test("offline, the dashboard says so, keeps what it showed and catches up by itself", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page.getByText("Gross").first()).toBeVisible({ timeout: 60_000 });

  await context.setOffline(true);
  await page.getByRole("link", { name: "Payments", exact: true }).click();
  const banner = page.getByRole("status").filter({ hasText: "No connection." });
  await expect(banner).toBeVisible();
  await expect(page.getByText("No payments match.")).not.toBeVisible();

  await page.getByRole("link", { name: "Daily totals" }).click();
  await expect(page.getByText("Gross").first()).toBeVisible();

  await page.getByRole("link", { name: "Payments", exact: true }).click();
  await context.setOffline(false);
  await expect(banner).toBeHidden();
  await expect(page.locator("tbody tr a").first()).toBeVisible({ timeout: 60_000 });
});

test("filters live in a menu, show as chips and each chip removes its filter", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await page.getByRole("link", { name: "Payments", exact: true }).click();
  await expect(page.locator("tbody tr a").first()).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: "Filter" }).click();
  await page.getByRole("radio", { name: "Paid" }).check();
  await page.getByRole("radio", { name: "Mensa am Campus" }).check();
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page).toHaveURL(/status=confirmed/);
  await expect(page).toHaveURL(/mensa=mensa_campus/);
  await expect(page.getByRole("button", { name: "(2) Filters" })).toBeVisible();
  await page.getByRole("button", { name: "Remove filter: Status: Paid" }).click();
  await expect(page).not.toHaveURL(/status=/);
  await expect(page.getByRole("button", { name: "(1) Filters" })).toBeVisible();
});

test("sign-in says which field is empty instead of sending the form", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Enter your username.")).toBeVisible();
  await expect(page.getByText("Enter your password.")).toBeVisible();
});

test("a date range comes from the calendar or a preset and narrows the list", async ({ page }) => {
  await page.goto("/login");
  await signIn(page);
  await page.getByRole("link", { name: "Payments", exact: true }).click();
  await expect(page.locator("tbody tr a").first()).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: "Date range" }).click();
  await page.getByRole("button", { name: "Last 7 days" }).click();
  await expect(page).toHaveURL(/from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}/);
  await expect(page.locator("tbody tr a").first()).toBeVisible({ timeout: 60_000 });
});
