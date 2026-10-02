import { expect, type Locator, type Page } from '@playwright/test'

export class TransactionsPage {
  readonly addBalanceButton: Locator
  readonly modal: Locator
  readonly balanceInput: Locator
  readonly addButton: Locator
  readonly cancelButton: Locator
  readonly table: Locator
  readonly rows: Locator

  constructor(private readonly page: Page) {
    this.addBalanceButton = page.getByRole('button', { name: 'Add balance' })
    this.modal = page.locator('.modal')
    this.balanceInput = page.locator('input[name="balance"]')
    this.addButton = page.getByRole('button', { name: 'Add', exact: true })
    this.cancelButton = page.getByRole('button', { name: 'Cancel', exact: true })
    this.table = page.getByRole('table')
    this.rows = this.table.locator('tbody tr')
  }

  async open() {
    await this.page.goto('/transactions')
    await expect(this.page).toHaveURL('/transactions')
  }

  async openBalanceModal() {
    await this.addBalanceButton.click()
    await expect(this.modal).toBeVisible()
  }

  async addBalance(amount: number) {
    await this.openBalanceModal()
    await this.balanceInput.fill(String(amount))
    await this.addButton.click()
    await expect(this.modal).toBeHidden()
  }

  async closeBalanceModal() {
    await this.cancelButton.click()
    await expect(this.modal).toBeHidden()
  }

  latestTransaction() {
    return this.rows.first()
  }
}
