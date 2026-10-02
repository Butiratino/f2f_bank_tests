import { type Locator, type Page } from '@playwright/test'

export class RegisterPage {
  readonly name: Locator
  readonly surname: Locator
  readonly email: Locator
  readonly password: Locator
  readonly registerButton: Locator
  readonly error: Locator

  constructor(private readonly page: Page) {
    this.name = page.locator('input[name="name"]')
    this.surname = page.locator('input[name="surname"]')
    this.email = page.locator('input[name="login"]')
    this.password = page.locator('input[name="Type your password"]')
    this.registerButton = page.getByRole('button', { name: 'Register' })
    this.error = page.locator('.error')
  }

  async open() {
    await this.page.goto('/register')
  }

  async register(name: string, surname: string, email: string, password: string) {
    await this.name.fill(name)
    await this.surname.fill(surname)
    await this.email.fill(email)
    await this.password.fill(password)
    await this.registerButton.click()
  }
}
