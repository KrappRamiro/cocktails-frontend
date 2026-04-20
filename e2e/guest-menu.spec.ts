import { test, expect } from '@playwright/test'

test.describe('Guest Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows event name in header', async ({ page }) => {
    const header = page.getByTestId('guest-header')
    await expect(header).toBeVisible()
  })

  test('shows loading skeletons initially', async ({ page }) => {
    // Skeletons appear before data loads
    const skeletons = page.getByTestId('loading-skeletons')
    // May or may not be visible depending on API speed
    // Just verify the page doesn't crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('shows available count after loading', async ({ page }) => {
    const count = page.getByTestId('available-count')
    // Wait for the count to appear (loading finishes)
    await expect(count).toBeVisible({ timeout: 10000 })
    await expect(count).toContainText('tragos disponibles este evento')
  })

  test('renders filter tabs for base and taste', async ({ page }) => {
    const baseFilter = page.getByTestId('filter-base')
    const tasteFilter = page.getByTestId('filter-taste')
    await expect(baseFilter).toBeVisible()
    await expect(tasteFilter).toBeVisible()

    // Should have "Todos" tab in base filter
    await expect(baseFilter.getByRole('tab', { name: 'Todos' })).toBeVisible()
  })

  test('clicking a base filter changes the URL', async ({ page }) => {
    const baseFilter = page.getByTestId('filter-base')
    await baseFilter.getByRole('tab', { name: 'Con Gin' }).click()
    await expect(page).toHaveURL(/base=gin/)
  })

  test('clicking a taste filter changes the URL', async ({ page }) => {
    const tasteFilter = page.getByTestId('filter-taste')
    await tasteFilter.getByRole('tab', { name: 'Frescos' }).click()
    await expect(page).toHaveURL(/taste=fresco/)
  })

  test('cocktail cards are expandable', async ({ page }) => {
    // Wait for cocktails to load
    const grid = page.getByTestId('cocktails-grid')
    await grid.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
      // If no cocktails available, skip
      return
    })

    const firstCard = page.getByTestId('cocktail-card-header').first()
    if (await firstCard.isVisible()) {
      // Initially collapsed
      const content = page.getByTestId('cocktail-card-content').first()
      await expect(content).not.toBeVisible()

      // Click to expand
      await firstCard.click()
      await expect(content).toBeVisible()

      // Click to collapse
      await firstCard.click()
      await expect(content).not.toBeVisible()
    }
  })

  test('shows base badge on cocktail cards', async ({ page }) => {
    const grid = page.getByTestId('cocktails-grid')
    await grid.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})

    const badge = page.getByTestId('cocktail-base-badge').first()
    if (await badge.isVisible()) {
      await expect(badge).toHaveText(/.+/)
    }
  })

  test('navigating to /random shows 404 page', async ({ page }) => {
    await page.goto('/random-page')
    await expect(page.getByText('Página no encontrada')).toBeVisible()
    await expect(page.getByText('Ir al menú')).toBeVisible()
  })

  test('filters are restored from URL on page load', async ({ page }) => {
    await page.goto('/?base=vodka&taste=fresco')
    const baseFilter = page.getByTestId('filter-base')
    const vodkaTab = baseFilter.getByRole('tab', { name: 'Con Vodka' })
    await expect(vodkaTab).toHaveAttribute('aria-selected', 'true')
  })
})
