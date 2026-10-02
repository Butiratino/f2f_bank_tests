import { expect, type Locator, type Page } from '@playwright/test'

export class Header {
  readonly mainLink: Locator
  readonly brandLink: Locator
  readonly profileLink: Locator
  readonly transactionsLink: Locator
  readonly logoutButton: Locator

  constructor(private readonly page: Page) {
    this.mainLink = page.getByRole('link', { name: 'Main' })
    this.brandLink = page.getByRole('link', { name: 'F2F Bank' })
    this.profileLink = page.getByRole('link', { name: 'Profile' })
    this.transactionsLink = page.getByRole('link', { name: 'Transactions' })
    this.logoutButton = page.locator('header button')
  }

  balance() {
    return this.page.getByText(/Balance:/)
  }

  async openProfile() {
    await this.profileLink.click()
    await expect(this.page).toHaveURL('/profile')
  }

  async openTransactions() {
    await this.transactionsLink.click()
    await expect(this.page).toHaveURL('/transactions')
  }

  async openBrand() {
    await this.brandLink.click()
    await expect(this.page).toHaveURL('/login')
  }

  async logout() {
    await this.logoutButton.click()
    await expect(this.page).toHaveURL('/login')
  }
}
