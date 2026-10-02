import { expect, type Page } from '@playwright/test'
import { RegisterPage } from '../pages/RegisterPage'
import type { TestUser } from './testData'

export async function registerUser(page: Page, user: TestUser) {
  const registerPage = new RegisterPage(page)

  await registerPage.open()
  await registerPage.register(user.name, user.surname, user.email, user.password)
  await expect(page).toHaveURL('/login')
}
