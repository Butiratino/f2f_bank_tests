import { expect, type Page } from '@playwright/test'

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/profile')
    await expect(this.page).toHaveURL('/profile')
  }

  value(label: 'Name:' | 'Surname:' | 'Email:') {
    return this.page.getByText(label, { exact: true }).locator('..')
  }
}
