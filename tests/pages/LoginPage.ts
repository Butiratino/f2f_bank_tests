import { type Locator, type Page } from '@playwright/test'

export class LoginPage {
  readonly email: Locator
  readonly password: Locator
  readonly loginButton: Locator

  constructor(private readonly page: Page) {
    this.email = page.locator('input[name="email"]')
    this.password = page.locator('input[name="password"]')
    this.loginButton = page.getByRole('button', { name: 'Login' })
  }

  async open() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.loginButton.click()
  }
}
