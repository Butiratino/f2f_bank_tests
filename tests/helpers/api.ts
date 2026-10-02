import { expect, type APIRequestContext } from '@playwright/test'
import { createUser, type TestUser } from './testData'

export async function loginApi(request: APIRequestContext, email: string, password: string) {
  const response = await request.post('/api/auth/login', {
    data: { email, password },
  })

  expect(response.status()).toBe(200)
}

export async function addBalanceApi(request: APIRequestContext, amount: number) {
  const response = await request.post('/api/users/balance/add', {
    data: { amount },
  })

  expect(response.status()).toBe(200)
}

export async function loginAndFundApi(
  request: APIRequestContext,
  email: string,
  password: string,
  amount: number,
) {
  await loginApi(request, email, password)
  await addBalanceApi(request, amount)
}

export async function registerApi(request: APIRequestContext, user: TestUser) {
  const response = await request.post('/api/auth/register', {
    data: { ...user, role: 'user' },
  })
  expect(response.status()).toBe(201)
}

export async function createAndRegisterApi(request: APIRequestContext) {
  const user = createUser()
  await registerApi(request, user)
  return user
}

export async function registerAndLoginApi(request: APIRequestContext) {
  const user = createUser()
  await registerApi(request, user)
  await loginApi(request, user.email, user.password)
  return user
}

export async function registerLoginAndFundApi(request: APIRequestContext, amount: number) {
  const user = await registerAndLoginApi(request)
  await addBalanceApi(request, amount)
  return user
}

export async function getTransactionsApi(request: APIRequestContext) {
  const response = await request.get('/api/users/transactions')
  expect(response.status()).toBe(200)
  return response.json()
}

export async function getBalanceApi(request: APIRequestContext) {
  const response = await request.get('/api/users/balance')
  expect(response.status()).toBe(200)
  return response.json()
}

export async function getCurrentUserApi(request: APIRequestContext) {
  const response = await request.get('/api/users/current')
  expect(response.status()).toBe(200)
  return response.json()
}

export async function logoutApi(request: APIRequestContext) {
  const response = await request.get('/api/auth/logout')
  expect(response.status()).toBe(200)
}
