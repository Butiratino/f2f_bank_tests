import { test, expect } from '@playwright/test'
import { TransactionsPage } from '../pages/TransactionsPage'
import { Header } from '../pages/Header'
import { LoginPage } from '../pages/LoginPage'
import { registerUser } from '../helpers/register'
import { loginAs } from '../helpers/login'
import { createAndRegisterApi } from '../helpers/api'
import { createUser, topUpAmount, transferData, zeroAmount } from '../helpers/testData'

test.describe('Баланс и транзакции', { tag: ['@ui', '@transaction', '@balance'] }, () => {
  // TC-BAL-001: окно пополнения открывается и закрывается.
  test('пользователь может открыть и закрыть окно пополнения', { tag: ['@low'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.openBalanceModal()
    await transactionsPage.closeBalanceModal()
  })

  // TC-BAL-002: пополнение обновляет баланс и историю.
  test('положительное пополнение обновляет баланс и создает транзакцию', { tag: ['@critical', '@smoke', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'В таблице сначала отображается статус, затем тип операции')
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await expect(transactionsPage.table.locator('thead th')).toHaveText([
      'Operation ID',
      'Date',
      'Operation Type',
      'Operation Status',
      'Sum',
    ])
    await transactionsPage.addBalance(topUpAmount)

    await expect(page.getByText(`Balance: ${topUpAmount}`)).toBeVisible()
    await expect(transactionsPage.table).toContainText(String(topUpAmount))

    const row = transactionsPage.latestTransaction()
    await expect(row.locator('td').nth(0)).toHaveText(/\S+/)
    await expect(row.locator('td').nth(1)).toHaveText(/\S+/)
    await expect(row.locator('td').nth(2)).toHaveText('deposit')
    await expect(row.locator('td').nth(3)).toHaveText('completed')
    await expect(row.locator('td').nth(4)).toHaveText(String(topUpAmount))
  })

  // TC-BAL-003: минимальная сумма пополнения.
  test('пополнение принимает сумму 0.01', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.addBalance(transferData.minAmount)

    await expect(page.getByText(`Balance: ${transferData.minAmount}`)).toBeVisible()
    await expect(transactionsPage.table).toContainText(String(transferData.minAmount))
  })

  // TC-BAL-004: пополнение на 0.99.
  test('пополнение принимает сумму 0.99', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.addBalance(transferData.maxCentsAmount)

    await expect(page.getByText(`Balance: ${transferData.maxCentsAmount}`)).toBeVisible()
    await expect(transactionsPage.table).toContainText(String(transferData.maxCentsAmount))
  })

  // TC-BAL-005: пополнение на целую сумму.
  test('пополнение принимает целую сумму 1', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.addBalance(transferData.integerAmount)

    await expect(page.getByText(`Balance: ${transferData.integerAmount}`)).toBeVisible()
    await expect(transactionsPage.table).toContainText(String(transferData.integerAmount))
  })

  // TC-BAL-006: пополнение на большую сумму.
  test('пополнение принимает сумму 999.99', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.addBalance(transferData.largeAmount)

    await expect(page.getByText(`Balance: ${transferData.largeAmount}`)).toBeVisible()
    await expect(transactionsPage.table).toContainText(String(transferData.largeAmount))
  })

  // TC-BAL-007: лишние знаки в сумме пополнения.
  test('пополнение отклоняет сумму с лишними знаками после запятой', { tag: ['@high', '@negative', '@validation', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма пополнения принимает сумму с тремя знаками после запятой')
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.openBalanceModal()
    await transactionsPage.balanceInput.fill(String(transferData.tooPreciseAmount))
    await transactionsPage.addButton.click()

    await expect(transactionsPage.modal).toBeVisible()
  })

  // TC-BAL-008: нулевое пополнение не отправляется.
  test('нулевая сумма не закрывает окно пополнения', { tag: ['@high', '@negative'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.openBalanceModal()
    await transactionsPage.balanceInput.fill(String(zeroAmount))
    await transactionsPage.addButton.click()

    await expect(transactionsPage.modal).toBeVisible()
  })

  // TC-BAL-009: баланс восстанавливается после повторного входа.
  test('после повторного входа отображается актуальный баланс', { tag: ['@medium', '@regression', '@need2fix'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const transactionsPage = new TransactionsPage(page)
    await transactionsPage.open()
    await transactionsPage.addBalance(topUpAmount)

    await new Header(page).logout()
    await page.reload()

    const loginPage = new LoginPage(page)
    await loginPage.login(user.email, user.password)
    test.fixme(true, 'После повторного входа header показывает баланс 0 вместо актуального')
    await expect(new Header(page).balance()).toHaveText(`Balance: ${topUpAmount}`)
  })
})