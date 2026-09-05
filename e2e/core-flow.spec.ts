import { test, expect } from '@playwright/test';

function uniqueEmail() {
  return `player-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

test('signup, purchase a ticket, and view history end to end', async ({ page }) => {
  const email = uniqueEmail();
  const password = 'correct horse battery staple';

  await page.goto('/signup');
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (8자 이상)').fill(password);
  await page.getByRole('button', { name: '가입하기' }).click();

  await page.waitForURL('**/play');

  await page.getByRole('button', { name: '자동 선택 구매' }).click();
  await expect(page.getByText(/당첨 번호:/)).toBeVisible();

  await page.getByRole('link', { name: '내 기록' }).click();
  await page.waitForURL('**/history');
  await expect(page.getByText(/당첨 번호:/)).toBeVisible();
});
