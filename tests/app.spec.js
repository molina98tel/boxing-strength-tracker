import { test, expect } from '@playwright/test';

const APP = 'http://127.0.0.1:4173/';

async function reset(page){
  await page.goto(APP);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.describe('Boxing Strength Tracker - core flows', () => {
  test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.addInitScript(() => {
      window.__e2eErrors = [];
      window.addEventListener('error', e => window.__e2eErrors.push(e.message));
    });
    await reset(page);
    page.on('dialog', async dialog => await dialog.accept());
  });

  test('loads, switches days, opens technique and substitutes an exercise', async ({ page }) => {
    await expect(page.locator('#title')).toHaveText('Día A');
    await expect(page.locator('.exercise')).toHaveCount(7);

    await page.locator('.day[data-day="B"]').click();
    await expect(page.locator('#title')).toHaveText('Día B');
    await expect(page.locator('.exercise')).toContainText('Peso muerto rumano');

    await page.locator('.tech').first().click();
    await expect(page.locator('#modal')).not.toHaveClass(/hidden/);
    await page.locator('#close').click();
    await expect(page.locator('#modal')).toHaveClass(/hidden/);

    const firstSwap = page.locator('.swap').first();
    await expect(firstSwap).toBeVisible();
    await firstSwap.click();
    await expect(page.locator('.exercise').first()).not.toContainText('Peso muerto rumano');
    await page.reload();
    await expect(page.locator('.exercise').first()).not.toContainText('Peso muerto rumano');
  });

  test('target load, set completion, timer, advice and add-set work', async ({ page }) => {
    const squat = page.locator('.exercise').filter({ hasText: 'Sentadilla' }).first();
    await expect(squat).toBeVisible();

    const target = squat.locator('.target');
    if (await target.count()) {
      await target.click();
      await expect(squat.locator('.kg').first()).not.toHaveValue('');
      await expect(squat.locator('.rp').first()).not.toHaveValue('');
    }

    await squat.locator('.kg').first().fill('100');
    await squat.locator('.rp').first().fill('5');
    await squat.locator('.ri').first().selectOption('3');
    await squat.locator('.check').first().click();

    await expect(squat.locator('.check.done')).toHaveCount(1);
    await expect(page.locator('#timer')).not.toHaveClass(/hidden/);
    await expect(squat.locator('.nextadvice')).toContainText('subir');

    const before = await squat.locator('.set').count();
    await squat.locator('.add').click();
    await expect(squat.locator('.set')).toHaveCount(before + 1);

    await page.locator('#plus').click();
    await page.locator('#skip').click();
    await expect(page.locator('#timer')).toHaveClass(/hidden/);
  });

  test('save session, progress, goals, planner and history work', async ({ page }) => {
    const squat = page.locator('.exercise').filter({ hasText: 'Sentadilla' }).first();
    await squat.locator('.kg').first().fill('100');
    await squat.locator('.rp').first().fill('5');
    await squat.locator('.ri').first().selectOption('2');
    await squat.locator('.check').first().click();

    await page.locator('#rpe').fill('7');
    await page.locator('#duration').fill('45');
    await page.locator('#boxing').selectOption('4');
    await page.locator('#boxingIntensity').selectOption('technical');
    await page.locator('#notes').fill('E2E test');
    await page.locator('#save').click();

    await expect(page.locator('#title')).toHaveText('Día A');
    await page.locator('.tab[data-v="progress"]').click();
    await expect(page.locator('#kpis')).toContainText('1');
    await expect(page.locator('#planner')).not.toBeEmpty();

    await page.locator('#goalSquat').fill('140');
    await page.locator('#saveGoals').click();
    await expect(page.locator('#goalsList')).toContainText('Sentadilla');

    const todayPlan = page.locator('.weekday.today');
    await todayPlan.locator('.plan[data-t="boxing"]').click();
    await expect(page.locator('#planner')).toContainText(/Boxeo|sparring|Técnico|Normal|Recuperación/i);

    await page.locator('.tab[data-v="history"]').click();
    await expect(page.locator('#historyList')).toContainText('Día A');
    const del = page.locator('.delete').first();
    await del.click();
    await expect(page.locator('#historyList')).toContainText('No hay sesiones');
  });

  test('settings, export, import and clear work', async ({ page }) => {
    await page.locator('.tab[data-v="settings"]').click();
    await page.locator('#name').fill('Javier');
    await page.locator('#goal').selectOption('strength');
    await page.locator('#saveSettings').click();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export2').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^boxing-strength-\d{4}-\d{2}-\d{2}\.json$/);

    const fixture = {
      version: 4,
      profile: { name: 'Importado', goal: 'performance' },
      sessions: [{
        id: 999,
        date: new Date().toISOString(),
        day: 'C',
        exercises: [{ name: 'Front squat', sets: [{ weight: 80, reps: 5, rir: 2, done: true, speed: null }] }],
        rpe: 6, duration: 45, boxingFeel: 4, boxingIntensity: 'normal', notes: 'import'
      }],
      week: {}, goals: { 'Sentadilla': 140 }, substitutions: {}
    };
    const input = page.locator('#import');
    await input.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(fixture))
    });
    await expect(page.locator('#kpis')).toContainText('1');
    await expect(page.locator('#goalsList')).toContainText('Sentadilla');

    await page.locator('.tab[data-v="settings"]').click();
    await page.locator('#clear').click();
    await page.waitForTimeout(100);
    await expect(page.locator('#title')).toHaveText('Día A');
    await page.locator('.tab[data-v="history"]').click();
    await expect(page.locator('#historyList')).toContainText('No hay sesiones');
  });

  test('mobile layout has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
    await page.locator('.tab[data-v="progress"]').click();
    const overflowProgress = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflowProgress).toBe(false);
  });
});
