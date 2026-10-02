import { test, expect } from '@playwright/test'
import { createAndRegisterApi, getCurrentUserApi, loginApi, logoutApi } from '../helpers/api'
import {
  cyrillicEmail,
  cyrillicPassword,
  createUser,
  invalidEmailDoubleAt,
  invalidEmailWithoutDomain,
  tooLongEmail,
  tooLongName,
  tooLongPassword,
  tooLongSurname,
  tooShortEmail,
  tooShortPassword,
  whitespace,
} from '../helpers/testData'

function registrationPayload(overrides: Record<string, unknown> = {}) {
  const user = createUser()

  return {
    name: user.name,
    surname: user.surname,
    email: user.email,
    password: user.password,
    role: 'user',
    ...overrides,
  }
}

test.describe('API: регистрация', { tag: ['@api', '@registration'] }, () => {
  // TC-API-REG-001: регистрация с валидными данными.
  test('регистрирует пользователя', { tag: ['@critical', '@smoke'] }, async ({ request }) => {
    const payload = registrationPayload()
    const response = await request.post('/api/auth/register', { data: payload })

    expect(response.status()).toBe(201)

    const body = await response.json()
    expect(body.email).toBe(payload.email)
    expect(body.name).toBe(payload.name)
    expect(body.surname).toBe(payload.surname)
    expect(body).not.toHaveProperty('password')
  })

  // TC-API-REG-002: клиент не создаёт администратора.
  test('отклоняет роль администратора', { tag: ['@critical', '@security', '@negative', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'Регистрация принимает роль admin от клиента')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ role: 'admin' }),
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-REG-003: email без доменной зоны.
  test('отклоняет email без доменной зоны', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 400 вместо 422 для email без доменной зоны')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: invalidEmailWithoutDomain }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-004: два символа @ в email.
  test('отклоняет email с двумя @', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 400 вместо 422 для email с двумя @')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: invalidEmailDoubleAt }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-005: короткий email.
  test('отклоняет короткий email', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает email короче 6 символов')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: tooShortEmail }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-006: кириллица в email.
  test('отклоняет кириллический email', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 400 вместо 422 для кириллического email')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: cyrillicEmail }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-007: кириллица в пароле.
  test('отклоняет кириллический пароль', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'Регистрация принимает кириллический пароль')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ password: cyrillicPassword }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-008: короткий пароль.
  test('отклоняет короткий пароль', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает пароль короче 8 символов')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ password: tooShortPassword }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-009: длинный пароль.
  test('отклоняет длинный пароль', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает пароль длиннее 64 символов')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ password: tooLongPassword }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-010: пустое имя.
  test('отклоняет пустое имя', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'Регистрация принимает пустое имя')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ name: '' }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-011: имя из пробелов.
  test('отклоняет имя из пробелов', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'Регистрация принимает имя из пробелов')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ name: whitespace }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-012: email из пробелов.
  test('отклоняет email из пробелов', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 400 вместо 422 для email из пробелов')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: whitespace }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-013: отсутствующее поле email.
  test('отклоняет регистрацию без email', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const { email: _email, ...payload } = registrationPayload()
    const response = await request.post('/api/auth/register', { data: payload })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-014: null в email.
  test('отклоняет null в email', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: null }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-015: длина email.
  test('ограничивает длину email', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 500 вместо 422 для длинного email')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ email: tooLongEmail }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-016: длина имени.
  test('ограничивает длину имени', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 500 вместо 422 для длинного имени')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ name: tooLongName }),
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-REG-017: длина фамилии.
  test('ограничивает длину фамилии', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 500 вместо 422 для длинной фамилии')
    const response = await request.post('/api/auth/register', {
      data: registrationPayload({ surname: tooLongSurname }),
    })
    expect(response.status()).toBe(422)
  })
})

test.describe('API: авторизация', { tag: ['@api', '@auth'] }, () => {
  // TC-API-AUTH-001: вход с валидными данными.
  test('авторизует пользователя', { tag: ['@critical', '@smoke'] }, async ({ request }) => {
    const user = await createAndRegisterApi(request)
    const response = await request.post('/api/auth/login', { data: user })
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.token).toBeTruthy()
  })

  // TC-API-AUTH-002: текущий пользователь.
  test('возвращает текущего пользователя', { tag: ['@high', '@regression'] }, async ({ request }) => {
    const user = await createAndRegisterApi(request)
    await loginApi(request, user.email, user.password)

    const body = await getCurrentUserApi(request)

    expect(body).toMatchObject({
      email: user.email,
      role: 'user',
    })
    expect(body.id).toEqual(expect.any(String))
  })

  // TC-API-AUTH-003: доступ после выхода.
  test('закрывает доступ после выхода', { tag: ['@critical', '@security'] }, async ({ request }) => {
    const user = await createAndRegisterApi(request)
    await loginApi(request, user.email, user.password)
    await logoutApi(request)

    const response = await request.get('/api/users/current')

    expect(response.status()).toBe(401)
  })

  // TC-API-AUTH-004: защищённые маршруты без авторизации.
  test('закрывает защищённые маршруты без входа', { tag: ['@critical', '@security', '@negative'] }, async ({ request }) => {
    const currentUserResponse = await request.get('/api/users/current')
    const balanceResponse = await request.get('/api/users/balance')
    const transactionsResponse = await request.get('/api/users/transactions')
    const transferResponse = await request.post('/api/users/transfer', {
      data: { phone: '+79991234567', amount: 1, purpose: 'Test transfer' },
    })

    expect(currentUserResponse.status()).toBe(401)
    expect(balanceResponse.status()).toBe(401)
    expect(transactionsResponse.status()).toBe(401)
    expect(transferResponse.status()).toBe(401)
  })

  // TC-API-AUTH-005: email без доменной зоны.
  test('отклоняет email без доменной зоны при входе', { tag: ['@high', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает email без доменной зоны при входе')
    const response = await request.post('/api/auth/login', {
      data: { email: invalidEmailWithoutDomain, password: 'Password123' },
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-AUTH-006: кириллица в пароле.
  test('отклоняет кириллицу в пароле при входе', { tag: ['@medium', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API возвращает 401 вместо 422 для кириллического пароля при входе')
    const user = await createAndRegisterApi(request)
    const response = await request.post('/api/auth/login', {
      data: { email: user.email, password: cyrillicPassword },
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-AUTH-007: вход без email.
  test('отклоняет вход без email', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { password: 'Password123' },
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-AUTH-008: вход без пароля.
  test('отклоняет вход без пароля', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'missing@example.com' },
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-AUTH-009: null в email.
  test('отклоняет null в email при входе', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: null, password: 'Password123' },
    })
    expect(response.status()).toBe(422)
  })

  // TC-API-AUTH-010: null в пароле.
  test('отклоняет null в пароле при входе', { tag: ['@high', '@validation'] }, async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'missing@example.com', password: null },
    })
    expect(response.status()).toBe(422)
  })
})