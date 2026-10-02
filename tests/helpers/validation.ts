import { expect, type Locator } from '@playwright/test'

export async function expectInvalid(input: Locator) {
  const isValid = await input.evaluate(element => (element as HTMLInputElement).validity.valid)

  expect(isValid).toBe(false)
}
