import { test, expect } from '@playwright/test'
import { ProfilePage } from '../pages/ProfilePage'
import { createUser } from '../helpers/testData'
import { registerUser } from '../helpers/register'
import { loginAs } from '../helpers/login'

// TC-PROFILE-001: профиль показывает имя, фамилию и email.
test('профиль отображает данные пользователя', { tag: ['@ui', '@profile', '@low'] }, async ({ page }) => {
  const user = createUser()
  await registerUser(page, user)
  await loginAs(page, user.email, user.password)

  const profilePage = new ProfilePage(page)
  await profilePage.open()

  await expect(profilePage.value('Name:')).toContainText(user.name)
  await expect(profilePage.value('Surname:')).toContainText(user.surname)
  await expect(profilePage.value('Email:')).toContainText(user.email)
})