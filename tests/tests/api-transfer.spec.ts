import { test, expect } from '@playwright/test'
import { getBalanceApi, getTransactionsApi, registerAndLoginApi, registerLoginAndFundApi } from '../helpers/api'
import { transferData } from '../helpers/testData'

test.describe('API: переводы', { tag: ['@api', '@transaction', '@transfer'] }, () => {
  // TC-API-TRANSFER-001: минимальный перевод.
  test('выполняет перевод на 0.01', { tag: ['@critical', '@smoke'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)
    const before = await getBalanceApi(request)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.minAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(200)

    const after = await getBalanceApi(request)
    expect(after.amount).toBeCloseTo(before.amount - transferData.minAmount, 2)
  })

  // TC-API-TRANSFER-002: перевод на 0.99.
  test('принимает перевод на 0.99', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.maxCentsAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-TRANSFER-003: целая сумма перевода.
  test('принимает перевод на 1', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.integerAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-TRANSFER-004: большая сумма перевода.
  test('принимает перевод на 999.99', { tag: ['@high', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 1000)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.largeAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(200)
  })

  // TC-API-TRANSFER-005: буквы в номере.
  test('отклоняет телефон с буквами', { tag: ['@high', '@negative', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает номер телефона с буквами после очистки символов')
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.invalidPhoneWithLetters,
        amount: transferData.minAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-006: короткий номер.
  test('отклоняет короткий телефон', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.invalidPhoneLess10,
        amount: transferData.minAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-007: длинный номер.
  test('отклоняет длинный телефон', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.invalidPhoneMoreThen15,
        amount: transferData.minAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-008: пустой номер.
  test('отклоняет пустой телефон', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: '',
        amount: transferData.minAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-009: пустая сумма.
  test('отклоняет пустую сумму', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerAndLoginApi(request)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: null,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-TRANSFER-010: пустое назначение.
  test('отклоняет пустое назначение', { tag: ['@high', '@negative', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает пустое назначение платежа')
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.minAmount,
        purpose: '',
      },
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-TRANSFER-011: длинное назначение.
  test('отклоняет длинное назначение', { tag: ['@medium', '@negative', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает назначение длиннее 256 символов')
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.minAmount,
        purpose: transferData.purposeOverflow,
      },
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-TRANSFER-012: нулевая сумма.
  test('отклоняет нулевую сумму', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: 0,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-013: отрицательная сумма.
  test('отклоняет отрицательную сумму', { tag: ['@high', '@negative', '@validation'] }, async ({ request }) => {
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.negativeAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(400)
  })

  // TC-API-TRANSFER-014: лишние знаки в сумме.
  test('отклоняет лишние знаки в сумме', { tag: ['@medium', '@negative', '@validation', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'API принимает сумму перевода с тремя знаками после запятой')
    await registerLoginAndFundApi(request, 100)

    const response = await request.post('/api/users/transfer', {
      data: {
        phone: transferData.recipientPhone,
        amount: transferData.tooPreciseAmount,
        purpose: transferData.purpose,
      },
    })

    expect(response.status()).toBe(422)
  })

  // TC-API-TRANSFER-015: данные перевода сохраняются в истории.
  test('сохраняет телефон и назначение перевода', { tag: ['@critical', '@regression', '@need2fix'] }, async ({ request }) => {
    test.fixme(true, 'История транзакций не содержит телефон и назначение')
    await registerLoginAndFundApi(request, 100)
    const beforeTransactions = await getTransactionsApi(request)
    const beforeIds = new Set(beforeTransactions.map((item: { id: string }) => item.id))
    const payload = {
      phone: transferData.recipientPhone,
      amount: transferData.maxCentsAmount,
      purpose: transferData.purpose,
    }

    const transferResponse = await request.post('/api/users/transfer', { data: payload })
    expect(transferResponse.status()).toBe(200)

    const transactions = await getTransactionsApi(request)
    const transaction = transactions.find(
      (item: { id: string; amount: number; transaction_type: string }) =>
        !beforeIds.has(item.id) &&
        item.amount === payload.amount &&
        item.transaction_type === 'withdrawal',
    )

    expect(transaction).toBeTruthy()
    expect(transaction.transaction_type).toBe('withdrawal')
    expect(transaction.transaction_status).toBe('completed')
    expect(transaction.user_id).toEqual(expect.any(String))
    expect(transaction.created_at).toEqual(expect.any(String))
    expect(transaction.updated_at).toEqual(expect.any(String))
    expect(transaction.phone).toBe(payload.phone)
    expect(transaction.purpose).toBe(payload.purpose)
  })
})