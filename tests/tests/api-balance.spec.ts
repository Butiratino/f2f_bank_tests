import { test, expect } from '@playwright/test'
import {
  getBalanceApi,
  getTransactionsApi,
  addBalanceApi,
  registerAndLoginApi,
} from '../helpers/api'
import { transferData } from '../helpers/testData'

test.describe('API: баланс', { tag: ['@api', '@transaction', '@balance'] }, () => {
  // TC-API-BAL-001: положительное пополнение.
  test('пополняет баланс', { tag: ['@critical', '@smoke'] }, async ({ request }) => {
    await registerAndLoginApi(request)
    const before = await getBalanceApi(request)

    await addBalanceApi(request, transferData.amount)

    const after = await getBalanceApi(request)
    expect(after.amount).toBeCloseTo(before.amount + transferData.amount, 2)
  })

  // TC-API-BAL-002: пополнение появляется в истории.
  test('сохраняет пополнение в истории', { tag: ['@high', '@regression'] }, async ({ request }) => {
    await registerAndLoginApi(request)
    const before = await getTransactionsApi(request)
    const beforeIds = new Set(before.map((item: { id: string }) => item.id))

    await addBalanceApi(request, transferData.amount)

    const after = await getTransactionsApi(request)
    const transaction = after.find(
      (item: { id: string; amount: number; transaction_type: string }) =>
        !beforeIds.has(item.id) &&
        item.amount === transferData.amount &&
        item.transaction_type === 'deposit',
    )

    expect(transaction).toMatchObject({
      amount: transferData.amount,
      transaction_type: 'deposit',
      transaction_status: 'completed',
    })
    expect(transaction.id).toEqual(expect.any(String))
    expect(transaction.user_id).toEqual(expect.any(String))
    expect(transaction.created_at).toEqual(expect.any(String))
    expect(transaction.updated_at).toEqual(expect.any(String))
  })

  // TC-API-BAL-003: минимальная сумма пополнения.
  test('принимает пополнение на 0.01', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.minAmount },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-BAL-004: пополнение на 0.99.
  test('принимает пополнение на 0.99', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.maxCentsAmount },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-BAL-005: целая сумма пополнения.
  test('принимает пополнение на 1', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.integerAmount },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-BAL-006: большая сумма пополнения.
  test('принимает пополнение на 999.99', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.largeAmount },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-BAL-007: лишние знаки в сумме пополнения.
  test('отклоняет лишние знаки в сумме', { tag: ['@medium', '@negative', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает пополнение с тремя знаками после запятой')
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.tooPreciseAmount },
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-BAL-008: нулевое пополнение.
  test('отклоняет нулевое пополнение', { tag: ['@high', '@negative'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: 0 },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-BAL-009: отрицательное пополнение.
  test('отклоняет отрицательное пополнение', { tag: ['@high', '@negative'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', {
      data: { amount: transferData.negativeAmount },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-BAL-010: пополнение без суммы.
  test('отклоняет пополнение без суммы', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/balance/add', { data: {} })

    expect(response.status()).toBe(422)
  })
})