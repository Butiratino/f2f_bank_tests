import { expect, type Locator, type Page } from '@playwright/test'

export class HomePage {
  readonly phone: Locator
  readonly amount: Locator
  readonly purpose: Locator
  readonly sendButton: Locator
  readonly cancelButton: Locator
  readonly phoneError: Locator

  constructor(private readonly page: Page) {
    this.phone = page.locator('input[name="phone"]')
    this.amount = page.locator('input[name="amount"]')
    this.purpose = page.locator('input[name="purpose"]')
    this.sendButton = page.getByRole('button', { name: 'Send' })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    this.phoneError = page.locator('.field-error')
  }

  async open() {
    await this.page.goto('/')
  }

  async fillTransfer(phone: string, amount: number, purpose: string) {
    await this.phone.fill(phone)
    await this.amount.fill(String(amount))
    await this.purpose.fill(purpose)
  }

  async submitTransfer() {
    await this.sendButton.click()
  }

  async expectSuccess() {
    await expect(this.page.getByText('Transfer completed', { exact: true })).toBeVisible()
  }
}
