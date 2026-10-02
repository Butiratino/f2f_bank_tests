import type { Page } from '@playwright/test'
import { Header } from '../pages/Header'
import { TransactionsPage } from '../pages/TransactionsPage'
import { loginAs } from './login'

export async function addBalance(page: Page, email: string, password: string, amount: number) {
  await loginAs(page, email, password)

  const header = new Header(page)
  await header.openTransactions()

  const transactionsPage = new TransactionsPage(page)
  await transactionsPage.addBalance(amount)
}
