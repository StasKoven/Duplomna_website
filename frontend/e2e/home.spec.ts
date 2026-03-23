import { test, expect } from '@playwright/test'

test.describe('Головна сторінка', () => {
  test('завантажується та показує основні секції', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TechStore/)
    // Hero section visible
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('навігація Header містить основні посилання', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('header')
    await expect(nav).toBeVisible()
    // Logo link
    await expect(nav.locator('a[href="/"]').first()).toBeVisible()
  })

  test('Footer відображається', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer).toContainText('TechStore')
  })
})
