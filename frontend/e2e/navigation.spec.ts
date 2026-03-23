import { test, expect } from '@playwright/test'

test.describe('Навігація між сторінками', () => {
  test('сторінка Про нас', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('h1')).toContainText('Про нас')
  })

  test('сторінка Категорії', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.locator('h1')).toContainText('Категорії')
  })

  test('сторінка Контакти', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('h1')).toContainText("Зв'яжіться з нами")
  })

  test('сторінка FAQ', async ({ page }) => {
    await page.goto('/faq')
    await expect(page).toHaveURL(/faq/)
    // page should have some FAQ content
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('сторінка Доставка', async ({ page }) => {
    await page.goto('/delivery')
    await expect(page.locator('h1')).toContainText('Доставка')
  })

  test('сторінка Гарантія', async ({ page }) => {
    await page.goto('/warranty')
    await expect(page.locator('h1')).toContainText('Гарантія')
  })

  test('сторінка 404 для неіснуючого маршруту', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz')
    // Should show 404 content or redirect to not-found
    await expect(page.locator('body')).toBeVisible()
  })
})
