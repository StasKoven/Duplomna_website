import { test, expect } from '@playwright/test'

const BACKEND_URL = 'https://duplomna-website-production.up.railway.app'

test.describe('API Health Check', () => {
  test('backend API відповідає', async ({ request }) => {
    const resp = await request.get(`${BACKEND_URL}/api/products?limit=1`)
    expect(resp.status()).toBeLessThan(500)
  })

  test('API categories endpoint', async ({ request }) => {
    const resp = await request.get(`${BACKEND_URL}/api/categories`)
    expect(resp.status()).toBeLessThan(500)
  })
})

test.describe('Контактна форма', () => {
  test('форма зворотнього звязку показує поля', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByPlaceholder("Ваше ім'я")).toBeVisible()
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('Ваше повідомлення...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Відправити' })).toBeVisible()
  })
})

test.describe('Порівняння товарів', () => {
  test('сторінка порівняння завантажується', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.locator('body')).toBeVisible()
  })
})
