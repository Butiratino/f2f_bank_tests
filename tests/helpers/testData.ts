export type TestUser = {
  name: string
  surname: string
  email: string
  password: string
}

export const invalidPassword = 'wrong-password'
export const cyrillicPassword = 'Пароль123'
export const invalidEmailWithoutDomain = 'user@123'
export const nativeInvalidEmail = 'user@'
export const tooShortEmail = 'a@b.c'
export const cyrillicEmail = 'example@тест.com'
export const emailPattern = '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\\.[A-Za-z]{2,}'
export const passwordPattern = '[A-Za-z0-9]+'
export const invalidEmailDoubleAt = 'user@@example.com'
export const whitespace = '   '
export const tooShortPassword = 'a'.repeat(7)
export const tooLongPassword = 'a'.repeat(65)
export const tooLongEmail = `${'a'.repeat(40)}@example.com`
export const tooLongName = 'n'.repeat(51)
export const tooLongSurname = 's'.repeat(257)
export const emailMaxLength = 50
export const emailMinLength = 6
export const passwordMinLength = 8
export const passwordMaxLength = 64
export const nameMaxLength = 50
export const surnameMaxLength = 256
export const nameMinLength = 1
export const surnameMinLength = 1

export function createMinBoundaryUser(): TestUser {
  const user = createUser()

  return {
    ...user,
    name: 'N',
    surname: 'S',
    password: 'a'.repeat(passwordMinLength),
  }
}

export function createMaxBoundaryUser(): TestUser {
  const user = createUser()
  const emailDomain = '@example.com'
  const maxLocalPartLength = emailMaxLength - emailDomain.length
  const emailLocalPart = user.email.split('@')[0].slice(0, maxLocalPartLength).padEnd(maxLocalPartLength, 'a')

  return {
    ...user,
    name: 'n'.repeat(nameMaxLength),
    surname: 's'.repeat(surnameMaxLength),
    email: `${emailLocalPart}${emailDomain}`,
    password: 'a'.repeat(passwordMaxLength),
  }
}

export const transferData = {
  recipientPhone: '+79991234567',
  invalidPhoneWithoutPlus: '79991234567',
  invalidPhoneWithLetters: '+7902123123афывфыв',
  invalidPhoneLess10: '+79991234',
  invalidPhoneMoreThen15: '+79991234123423123',
  purpose: 'Test transfer',
  purposeOverflow: 'x'.repeat(257),
  amount: 50,
  minAmount: 0.01,
  maxCentsAmount: 0.99,
  integerAmount: 1,
  largeAmount: 999.99,
  tooPreciseAmount: 0.001,
  negativeAmount: -50,
  insufficientFundsAmount: 1,
} as const

export const topUpAmount = 100
export const zeroAmount = 0

export function createUser(): TestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return {
    name: 'Playwright',
    surname: 'Tester',
    email: `e2e-${suffix}@test.local`,
    password: 'Password123',
  }
}
