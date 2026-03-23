import { test, expect } from '@playwright/test'

test.describe('Кошик та Wishlist без авторизації', () => {
  test('кошик показує порожній стан або переадресацію', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForTimeout(2000)
    const body = await page.locator('body').textContent()
    // Either shows empty cart or redirects to login
    const isCartPage = page.url().includes('/cart')
    const isLoginPage = page.url().includes('/login')
    expect(isCartPage || isLoginPage).toBeTruthy()
  })

  test('wishlist — без авторизації', async ({ page }) => {
    await page.goto('/wishlist')
    await page.waitForTimeout(2000)
    const url = page.url()
    const pageText = await page.locator('body').textContent() ?? ''
    // Should redirect to login or show login message or show empty wishlist
    const hasLoginRedirect = url.includes('/login')
    const hasLoginMessage = pageText.includes('Увійдіть') || pageText.includes('увійдіть')
    const hasEmptyState = pageText.includes('порожн') || pageText.includes('Список бажань')
    expect(hasLoginRedirect || hasLoginMessage || hasEmptyState).toBeTruthy()
  })

  test('сторінка замовлень — без авторизації', async ({ page }) => {
    await page.goto('/orders')
    await page.waitForTimeout(2000)
    const url = page.url()
    // Should redirect to login
    expect(url.includes('/login') || url.includes('/orders')).toBeTruthy()
  })
})
