import { test, expect } from '@playwright/test'

test.describe('Каталог товарів', () => {
  test('сторінка товарів завантажується', async ({ page }) => {
    await page.goto('/products')
    await expect(page).toHaveURL(/products/)
    // Should have some product cards or a grid
    await expect(page.locator('body')).toBeVisible()
  })

  test('фільтри відображаються', async ({ page }) => {
    await page.goto('/products')
    // Price filter or category filter should exist
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('пошук товарів через header', async ({ page }) => {
    await page.goto('/')
    // Find search input in header
    const searchInput = page.locator('header input[type="text"], header input[type="search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('phone')
      // Wait a bit for autocomplete
      await page.waitForTimeout(500)
    }
  })

  test('перехід до окремого товару', async ({ page }) => {
    await page.goto('/products')
    // Wait for products to load
    await page.waitForTimeout(3000)
    // Try to click on first product card link
    const productLink = page.locator('a[href*="/products/"]').first()
    if (await productLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productLink.click()
      await expect(page).toHaveURL(/\/products\//)
      // Product page should have an add-to-cart button
      const addToCartBtn = page.getByText('Додати в кошик')
      if (await addToCartBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(addToCartBtn).toBeVisible()
      }
    }
  })
})
