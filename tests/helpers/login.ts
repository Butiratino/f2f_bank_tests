import { expect, type Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

export async function loginAs(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page)

  await loginPage.open()
  await loginPage.login(email, password)
  await expect(page).toHaveURL('/')
}
