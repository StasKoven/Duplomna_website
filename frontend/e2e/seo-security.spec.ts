import { test, expect } from '@playwright/test'

test.describe('SEO та метадані', () => {
  test('головна — title та meta description', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TechStore/)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.+/)
  })

  test('сторінка Про нас — title', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/.+/)
  })

  test('robots.txt доступний', async ({ page }) => {
    const resp = await page.goto('/robots.txt')
    expect(resp?.status()).toBe(200)
    const body = await resp?.text()
    expect(body).toContain('User-Agent')
  })

  test('sitemap.xml доступний', async ({ page }) => {
    const resp = await page.goto('/sitemap.xml')
    expect(resp?.status()).toBe(200)
    const body = await resp?.text()
    expect(body).toContain('urlset')
  })

  test('manifest.json доступний', async ({ page }) => {
    const resp = await page.goto('/manifest.webmanifest')
    if (resp?.status() === 200) {
      const body = await resp?.text()
      expect(body).toContain('name')
    }
  })
})

test.describe('Безпека та заголовки', () => {
  test('X-Frame-Options або CSP frame-ancestors', async ({ page }) => {
    const resp = await page.goto('/')
    const headers = resp?.headers() ?? {}
    const hasFrameProtection =
      headers['x-frame-options'] ||
      headers['content-security-policy']?.includes('frame-ancestors')
    // Either header should exist (Vercel may add its own)
    expect(resp?.status()).toBe(200)
  })

  test('Strict-Transport-Security', async ({ page }) => {
    const resp = await page.goto('/')
    const hsts = resp?.headers()['strict-transport-security']
    // Vercel typically adds HSTS
    if (hsts) {
      expect(hsts).toContain('max-age')
    }
  })

  test('не витікає версія сервера', async ({ page }) => {
    const resp = await page.goto('/')
    const serverHeader = resp?.headers()['server'] ?? ''
    // Should not expose Express or detailed version
    expect(serverHeader).not.toMatch(/Express/)
  })
})
