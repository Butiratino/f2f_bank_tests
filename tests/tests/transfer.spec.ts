import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { Header } from '../pages/Header'
import { TransactionsPage } from '../pages/TransactionsPage'
import { registerUser } from '../helpers/register'
import { loginAs } from '../helpers/login'
import { addBalance } from '../helpers/balance'
import { createAndRegisterApi } from '../helpers/api'
import { expectInvalid } from '../helpers/validation'
import { createUser, topUpAmount, transferData } from '../helpers/testData'

test.describe('Переводы', { tag: ['@ui', '@main', '@transfer'] }, () => {
  // TC-TRANSFER-001: перевод при достаточном балансе.
  test('пользователь может выполнить перевод', { tag: ['@critical', '@smoke', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'В таблице сначала отображается статус, затем тип операции')
    const user = createUser()
    await registerUser(page, user)
    await addBalance(page, user.email, user.password, topUpAmount)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(
      transferData.recipientPhone,
      transferData.amount,
      transferData.purpose,
    )
    await homePage.submitTransfer()

    await homePage.expectSuccess()
    await expect(page.locator('header').getByText(`Balance: ${topUpAmount - transferData.amount}`)).toBeVisible()

    await new Header(page).openTransactions()
    const row = new TransactionsPage(page).latestTransaction()
    await expect(row.locator('td').nth(0)).toHaveText(/\S+/)
    await expect(row.locator('td').nth(1)).toHaveText(/\S+/)
    await expect(row.locator('td').nth(2)).toHaveText('withdrawal')
    await expect(row.locator('td').nth(3)).toHaveText('completed')
    await expect(row.locator('td').nth(4)).toHaveText(String(transferData.amount))
  })

  // TC-TRANSFER-002: пустой номер телефона.
  test('пустой номер телефона отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer('', transferData.amount, transferData.purpose)
    await homePage.submitTransfer()

    await expect(homePage.phoneError).toContainText('Phone number is required')
  })

  // TC-TRANSFER-003: пустая сумма.
  test('пустая сумма отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.amount, transferData.purpose)
    await homePage.amount.fill('')
    await homePage.submitTransfer()

    await expectInvalid(homePage.amount)
  })

  // TC-TRANSFER-004: пустое назначение.
  test('пустое назначение платежа отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.amount, transferData.purpose)
    await homePage.purpose.fill('')
    await homePage.submitTransfer()

    await expectInvalid(homePage.purpose)
  })

  // TC-TRANSFER-005: номер без плюса.
  test('номер телефона должен начинаться с плюса', { tag: ['@high', '@negative'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(
      transferData.invalidPhoneWithoutPlus,
      transferData.insufficientFundsAmount,
      transferData.purpose,
    )
    await homePage.submitTransfer()

    await expect(homePage.phoneError).toContainText('Must start with +')
  })

  // TC-TRANSFER-006: буквы в номере.
  test('номер телефона с буквами отклоняется', { tag: ['@high', '@negative', '@validation', '@need2fix'] }, async ({ page, request }) => {
    test.fixme(true, 'Форма перевода принимает номер телефона с буквами')
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.invalidPhoneWithLetters, transferData.amount, transferData.purpose)
    await homePage.submitTransfer()

    await expect(homePage.phoneError).toContainText('Phone')
  })

  // TC-TRANSFER-007: короткий номер.
  test('слишком короткий номер телефона отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.invalidPhoneLess10, transferData.amount, transferData.purpose)
    await homePage.submitTransfer()

    await expect(homePage.phoneError).toContainText('10–15 digits')
  })

  // TC-TRANSFER-008: длинный номер.
  test('слишком длинный номер телефона отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.invalidPhoneMoreThen15, transferData.amount, transferData.purpose)
    await homePage.submitTransfer()

    await expect(homePage.phoneError).toContainText('10–15 digits')
  })

  // TC-TRANSFER-009: длина назначения.
  test('назначение платежа ограничено 256 символами', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ page, request }) => {
    test.fixme(true, 'Форма перевода принимает назначение длиннее 256 символов')
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()

    await expect(homePage.purpose).toHaveAttribute('maxlength', '256')
    await homePage.purpose.fill(transferData.purposeOverflow)
    await expect(homePage.purpose).toHaveValue(transferData.purposeOverflow)
  })

  // TC-TRANSFER-010: минимальная сумма перевода.
  test('перевод принимает сумму 0.01', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await addBalance(page, user.email, user.password, topUpAmount)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.minAmount, transferData.purpose)
    await homePage.submitTransfer()

    await homePage.expectSuccess()
  })

  // TC-TRANSFER-011: перевод на 0.99.
  test('перевод принимает сумму 0.99', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await addBalance(page, user.email, user.password, topUpAmount)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.maxCentsAmount, transferData.purpose)
    await homePage.submitTransfer()

    await homePage.expectSuccess()
  })

  // TC-TRANSFER-012: перевод на целую сумму.
  test('перевод принимает целую сумму 1', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await addBalance(page, user.email, user.password, topUpAmount)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.integerAmount, transferData.purpose)
    await homePage.submitTransfer()

    await homePage.expectSuccess()
  })

  // TC-TRANSFER-013: перевод на большую сумму.
  test('перевод принимает сумму 999.99', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await addBalance(page, user.email, user.password, 1000)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.largeAmount, transferData.purpose)
    await homePage.submitTransfer()

    await homePage.expectSuccess()
  })

  // TC-TRANSFER-014: нулевая сумма.
  test('нулевая сумма отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, 0, transferData.purpose)
    await homePage.submitTransfer()

    await expect(page.getByText('Amount must be greater than zero')).toBeVisible()
  })

  // TC-TRANSFER-015: отрицательная сумма.
  test('отрицательная сумма отклоняется', { tag: ['@high', '@negative', '@validation'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.negativeAmount, transferData.purpose)
    await homePage.submitTransfer()

    await expect(page.getByText('Amount must be greater than zero')).toBeVisible()
  })

  // TC-TRANSFER-016: лишние знаки в сумме.
  test('сумма с лишними знаками после запятой отклоняется', { tag: ['@high', '@negative', '@validation', '@need2fix'] }, async ({ page, request }) => {
    test.fixme(true, 'Форма перевода принимает сумму с тремя знаками после запятой')
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(transferData.recipientPhone, transferData.tooPreciseAmount, transferData.purpose)
    await homePage.submitTransfer()

    await expectInvalid(homePage.amount)
  })

  // TC-TRANSFER-017: недостаточный баланс.
  test('перевод без достаточного баланса отклоняется', { tag: ['@high', '@negative'] }, async ({ page }) => {
    const user = createUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    const homePage = new HomePage(page)
    await homePage.open()
    await homePage.fillTransfer(
      transferData.recipientPhone,
      transferData.insufficientFundsAmount,
      transferData.purpose,
    )
    await homePage.submitTransfer()

    await expect(page.getByText('Transfer failed. Check your balance.')).toBeVisible()
  })
})