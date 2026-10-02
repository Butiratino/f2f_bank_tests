import { test, expect } from '@playwright/test'
import { RegisterPage } from '../pages/RegisterPage'
import { registerUser } from '../helpers/register'
import { expectInvalid } from '../helpers/validation'
import { Header } from '../pages/Header'
import {
  createUser,
  cyrillicEmail,
  cyrillicPassword,
  createMaxBoundaryUser,
  createMinBoundaryUser,
  emailPattern,
  emailMaxLength,
  emailMinLength,
  nativeInvalidEmail,
  nameMinLength,
  nameMaxLength,
  passwordMaxLength,
  passwordPattern,
  passwordMinLength,
  surnameMinLength,
  surnameMaxLength,
  whitespace,
} from '../helpers/testData'

test.describe('Регистрация', { tag: ['@ui', '@registration'] }, () => {
  // TC-REG-001: новая регистрация.
  test('новый пользователь может зарегистрироваться', { tag: ['@critical', '@smoke'] }, async ({ page }) => {
    const user = createUser()

    await registerUser(page, user)

    await expect(page).toHaveURL('/login')
  })

  // TC-REG-002: переход по логотипу без авторизации.
  test('логотип из регистрации не вызывает ошибку загрузки баланса для незалогиненного пользователя', { tag: ['@medium', '@regression', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Публичный логотип запрашивает защищённый баланс')
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    const header = new Header(page)

    await header.openBrand()

    await expect(page.getByText('Failed to load balance')).not.toBeVisible()
  })

  // TC-REG-003: минимальные допустимые значения.
  test('принимаются минимальные границы валидных полей', { tag: ['@medium', '@validation'] }, async ({ page }) => {
    const user = createMinBoundaryUser()

    await registerUser(page, user)

    await expect(page).toHaveURL('/login')
  })

  // TC-REG-004: максимальные значения полей.
  test('принимаются максимальные значения полей', { tag: ['@medium', '@validation'] }, async ({ page }) => {
    const user = createMaxBoundaryUser()

    await registerUser(page, user)

    await expect(page).toHaveURL('/login')
  })

  // TC-REG-005: повторная регистрация с тем же email.
  test('email существующего пользователя отклоняется', { tag: ['@high', '@negative'] }, async ({ page }) => {
    const registerPage = new RegisterPage(page)
    const user = createUser()

    await registerPage.open()
    await registerPage.register(user.name, user.surname, user.email, user.password)
    await expect(page).toHaveURL('/login')

    await registerPage.open()
    await registerPage.register(user.name, user.surname, user.email, user.password)

    await expect(registerPage.error).toContainText('already exists')
  })

  // TC-REG-006: поля регистрации помечены как обязательные.
  test('форма регистрации задаёт required для обязательных полей', { tag: ['@high', '@validation'] }, async ({ page }) => {
    const registerPage = new RegisterPage(page)

    await registerPage.open()

    await expect(registerPage.name).toHaveAttribute('required', '')
    await expect(registerPage.surname).toHaveAttribute('required', '')
    await expect(registerPage.email).toHaveAttribute('required', '')
    await expect(registerPage.password).toHaveAttribute('required', '')
  })

  // TC-REG-007: ограничения полей формы.
  test('форма содержит клиентские ограничения email и пароля', { tag: ['@high', '@validation', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма регистрации не задаёт pattern и ограничения длины полей')
    const registerPage = new RegisterPage(page)
    await registerPage.open()

    await expect.soft(registerPage.email).toHaveAttribute('pattern', emailPattern)
    await expect.soft(registerPage.email).toHaveAttribute('minlength', String(emailMinLength))
    await expect.soft(registerPage.email).toHaveAttribute('maxlength', String(emailMaxLength))
    await expect.soft(registerPage.password).toHaveAttribute('pattern', passwordPattern)
    await expect.soft(registerPage.password).toHaveAttribute('minlength', String(passwordMinLength))
    await expect.soft(registerPage.password).toHaveAttribute('maxlength', String(passwordMaxLength))
    await expect.soft(registerPage.name).toHaveAttribute('minlength', String(nameMinLength))
    await expect.soft(registerPage.name).toHaveAttribute('maxlength', String(nameMaxLength))
    await expect.soft(registerPage.surname).toHaveAttribute('minlength', String(surnameMinLength))
    await expect.soft(registerPage.surname).toHaveAttribute('maxlength', String(surnameMaxLength))
  })

  // TC-REG-008: браузерная проверка email.
  test('форма регистрации отклоняет явно некорректный email', { tag: ['@high', '@validation', '@negative'] }, async ({ page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    await registerPage.email.fill(nativeInvalidEmail)

    await expectInvalid(registerPage.email)
  })

  // TC-REG-009: кириллический email.
  test('форма регистрации не принимает кириллический email', { tag: ['@medium', '@validation', '@negative'] }, async ({ page }) => {
    test.fixme(true, 'Регистрация принимает кириллический email')
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    await registerPage.email.fill(cyrillicEmail)

    await expectInvalid(registerPage.email)
    await registerPage.registerButton.click()
    await expect(page).toHaveURL('/register')
  })

  // TC-REG-010: кириллический пароль.
  test('форма регистрации не принимает кириллический пароль', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Регистрация принимает кириллический пароль')
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    const user = createUser()
    const registrationResponse = page.waitForResponse(
      response => response.url().includes('/api/auth/register'),
    )
    await registerPage.register(user.name, user.surname, user.email, cyrillicPassword)

    await expect(page).toHaveURL('/register')
    const response = await registrationResponse
    expect(response.status()).toBe(422)
  })

  // TC-REG-011: пробелы в имени и фамилии.
  test('форма регистрации отклоняет значения из пробелов', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Регистрация принимает имя и фамилию из пробелов')
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    const user = createUser()
    const registrationResponse = page.waitForResponse(
      response => response.url().includes('/api/auth/register'),
    )
    await registerPage.register(whitespace, whitespace, user.email, user.password)

    await expect(page).toHaveURL('/register')
    const response = await registrationResponse
    expect(response.status()).toBe(422)
  })

  // TC-REG-012: email из пробелов.
  test('форма регистрации отклоняет email из пробелов', { tag: ['@medium', '@validation', '@negative'] }, async ({ page }) => {
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    await registerPage.email.fill(whitespace)

    await expectInvalid(registerPage.email)
    await registerPage.registerButton.click()
    await expect(page).toHaveURL('/register')
  })

  // TC-REG-013: пароль из пробелов.
  test('форма регистрации отклоняет пароль из пробелов', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Регистрация принимает пароль из пробелов')
    const registerPage = new RegisterPage(page)
    await registerPage.open()
    const user = createUser()
    const registrationResponse = page.waitForResponse(
      response => response.url().includes('/api/auth/register'),
    )
    await registerPage.register(user.name, user.surname, user.email, whitespace)

    await expect(page).toHaveURL('/register')
    const response = await registrationResponse
    expect(response.status()).toBe(422)
  })
})