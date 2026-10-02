import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { Header } from '../pages/Header'
import { loginAs } from '../helpers/login'
import { registerUser } from '../helpers/register'
import { createAndRegisterApi } from '../helpers/api'
import { expectInvalid } from '../helpers/validation'
import {
  createMaxBoundaryUser,
  createMinBoundaryUser,
  emailPattern,
  emailMaxLength,
  emailMinLength,
  nativeInvalidEmail,
  cyrillicEmail,
  cyrillicPassword,
  invalidPassword,
  passwordMaxLength,
  passwordPattern,
  passwordMinLength,
  tooLongEmail,
  tooLongPassword,
  tooShortEmail,
  tooShortPassword,
  whitespace,
} from '../helpers/testData'

test.describe('Авторизация', { tag: ['@ui', '@auth'] }, () => {
  // TC-AUTH-001: успешный вход с корректными данными.
  test('пользователь может войти с корректными данными', { tag: ['@critical', '@smoke'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    await expect(page.getByRole('link', { name: 'Main' })).toBeVisible()
  })

  // TC-AUTH-002: вход с минимальной длиной пароля.
  test('логин принимает минимальную длину пароля', { tag: ['@medium', '@validation'] }, async ({ page }) => {
    const user = createMinBoundaryUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    await expect(page.getByRole('link', { name: 'Main' })).toBeVisible()
  })

  // TC-AUTH-003: вход с максимальной длиной пароля.
  test('логин принимает максимальную длину пароля', { tag: ['@medium', '@validation'] }, async ({ page }) => {
    const user = createMaxBoundaryUser()
    await registerUser(page, user)
    await loginAs(page, user.email, user.password)

    await expect(page.getByRole('link', { name: 'Main' })).toBeVisible()
  })

  // TC-AUTH-004: неверный пароль не авторизует пользователя.
  test('пользователь видит ошибку при неверном пароле', { tag: ['@high', '@negative'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    const loginPage = new LoginPage(page)

    await loginPage.open()
    await loginPage.login(user.email, invalidPassword)

    await expect(page.getByText('Login failed')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  // TC-AUTH-005: выход очищает сессию.
  test('пользователь может выйти из аккаунта', { tag: ['@critical'] }, async ({ page, request }) => {
    const user = await createAndRegisterApi(request)
    await loginAs(page, user.email, user.password)

    await new Header(page).logout()

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  // TC-AUTH-006: переход по логотипу без авторизации.
  test('логотип из login не вызывает ошибку загрузки баланса для незалогиненного пользователя', { tag: ['@medium', '@regression', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Публичный логотип запрашивает защищённый баланс')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    const header = new Header(page)

    await header.openBrand()

    await expect(page.getByText('Failed to load balance')).not.toBeVisible()
  })

  // TC-AUTH-007: переход со страницы входа к регистрации.
  test('пользователь может открыть страницу регистрации', { tag: ['@low'] }, async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.open()
    await page.getByRole('link', { name: 'Register page' }).click()

    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible()
  })

  // TC-AUTH-008: браузерная проверка некорректного email.
  test('форма входа отклоняет явно некорректный email', { tag: ['@high', '@validation', '@negative'] }, async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(nativeInvalidEmail)

    await expectInvalid(loginPage.email)
  })

  // TC-AUTH-009: кириллический email не проходит вход.
  test('форма входа не принимает кириллический email', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page, request }) => {
    test.fixme(true, 'API принимает кириллический email при входе')
    const user = await createAndRegisterApi(request)
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(cyrillicEmail)
    await loginPage.password.fill(user.password)

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login'),
    )
    await loginPage.loginButton.click()
    const response = await responsePromise

    expect(response.status()).toBe(422)
    await expect(page).toHaveURL('/login')
  })

  // TC-AUTH-010: кириллический пароль не проходит вход.
  test('форма входа не принимает кириллический пароль', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page, request }) => {
    test.fixme(true, 'API возвращает 401 вместо 422 для кириллического пароля')
    const user = await createAndRegisterApi(request)
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(user.email)
    await loginPage.password.fill(cyrillicPassword)

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login'),
    )
    await loginPage.loginButton.click()
    const response = await responsePromise

    expect(response.status()).toBe(422)
    await expect(page).toHaveURL('/login')
  })

  // TC-AUTH-011: форма входа содержит ограничения полей.
  test('форма входа задает лимиты email и пароля', { tag: ['@high', '@validation', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа не задаёт pattern и ограничения длины полей')
    const loginPage = new LoginPage(page)
    await loginPage.open()

    await expect.soft(loginPage.email).toHaveAttribute('pattern', emailPattern)
    await expect.soft(loginPage.email).toHaveAttribute('minlength', String(emailMinLength))
    await expect.soft(loginPage.email).toHaveAttribute('maxlength', String(emailMaxLength))
    await expect.soft(loginPage.password).toHaveAttribute('pattern', passwordPattern)
    await expect.soft(loginPage.password).toHaveAttribute('minlength', String(passwordMinLength))
    await expect.soft(loginPage.password).toHaveAttribute('maxlength', String(passwordMaxLength))
  })

  // TC-AUTH-012: короткий email отклоняется.
  test('форма входа отклоняет слишком короткий email', { tag: ['@high', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа принимает слишком короткий email')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(tooShortEmail)

    await expectInvalid(loginPage.email)
  })

  // TC-AUTH-013: длинный email отклоняется.
  test('форма входа отклоняет слишком длинный email', { tag: ['@high', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа принимает слишком длинный email')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(tooLongEmail)

    await expectInvalid(loginPage.email)
  })

  // TC-AUTH-014: короткий пароль отклоняется.
  test('форма входа отклоняет слишком короткий пароль', { tag: ['@high', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа принимает слишком короткий пароль')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.password.fill(tooShortPassword)

    await expectInvalid(loginPage.password)
  })

  // TC-AUTH-015: длинный пароль отклоняется.
  test('форма входа отклоняет слишком длинный пароль', { tag: ['@high', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа принимает слишком длинный пароль')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.password.fill(tooLongPassword)

    await expectInvalid(loginPage.password)
  })

  // TC-AUTH-016: пустые обязательные поля отклоняются.
  test('форма входа отклоняет пустые обязательные поля', { tag: ['@high', '@validation', '@negative'] }, async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()

    await expectInvalid(loginPage.email)
    await expectInvalid(loginPage.password)
  })

  // TC-AUTH-017: пароль из пробелов отклоняется.
  test('форма входа отклоняет пароль из пробелов', { tag: ['@medium', '@validation', '@negative', '@need2fix'] }, async ({ page }) => {
    test.fixme(true, 'Форма входа принимает пароль из пробелов')
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.password.fill(whitespace)

    await expectInvalid(loginPage.password)
  })

  // TC-AUTH-018: email из пробелов отклоняется.
  test('форма входа отклоняет email из пробелов', { tag: ['@medium', '@validation', '@negative'] }, async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.open()
    await loginPage.email.fill(whitespace)

    await expectInvalid(loginPage.email)
  })

  // TC-AUTH-019: невалидная cookie не открывает защищённый маршрут.
  test('защищенный маршрут с невалидной cookie возвращает на логин', { tag: ['@critical', '@negative'] }, async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'access_token',
        value: 'invalid-token',
        domain: 'localhost',
        path: '/',
      },
    ])

    await page.goto('/profile')

    await expect(page).toHaveURL('/login')
  })
})