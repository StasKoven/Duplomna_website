import { test, expect } from '@playwright/test'

test.describe('Адаптивність (мобільний вигляд)', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone X

  test('мобільне меню відображається', async ({ page }) => {
    await page.goto('/')
    // On mobile, hamburger menu should exist
    const menuBtn = page.locator('header button').first()
    await expect(menuBtn).toBeVisible()
  })

  test('головна сторінка на мобільному', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TechStore/)
    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // small tolerance
  })

  test('сторінка товарів на мобільному', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator('body')).toBeVisible()
  })

  test('форма входу на мобільному', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
