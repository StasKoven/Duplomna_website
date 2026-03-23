import { test, expect } from '@playwright/test'

test.describe('Аутентифікація', () => {
  test('сторінка входу відображає форму', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Вхід')
    // Email & password fields (textboxes with placeholders)
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    // Google login button
    await expect(page.getByText('Увійти через Google')).toBeVisible()
    // Link to register
    await expect(page.locator('a[href*="register"]')).toBeVisible()
    // Forgot password link
    await expect(page.getByText('Забули пароль?')).toBeVisible()
  })

  test('сторінка реєстрації відображає форму', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h1')).toContainText('Створити аккаунт')
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
  })

  test('валідація логіну — порожня форма', async ({ page }) => {
    await page.goto('/login')
    // Submit empty form
    await page.locator('button[type="submit"]').click()
    // Should show validation errors (form should not navigate away)
    await expect(page).toHaveURL(/login/)
  })

  test('валідація реєстрації — невалідний email', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('your@email.com').fill('not-an-email')
    const submitBtn = page.locator('button[type="submit"]')
    await submitBtn.click()
    await expect(page).toHaveURL(/register/)
  })

  test('сторінка відновлення пароля', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('h1')).toContainText('Забули пароль?')
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
  })

  test('логін з невірними даними показує помилку', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('your@email.com').fill('nonexistent@test.com')
    await page.getByPlaceholder('••••••••').fill('WrongPassword1')
    await page.locator('button[type="submit"]').click()
    // Should stay on login or show error toast
    await page.waitForTimeout(3000)
    const url = page.url()
    expect(url).toMatch(/login/)
  })
})
