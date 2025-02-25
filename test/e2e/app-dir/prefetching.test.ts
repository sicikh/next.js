import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { waitFor } from 'next-test-utils'
import path from 'path'
import webdriver from 'next-webdriver'

describe('app dir prefetching', () => {
  // TODO: re-enable for dev after https://vercel.slack.com/archives/C035J346QQL/p1663822388387959 is resolved (Sep 22nd 2022)
  if ((global as any).isNextDeploy || (global as any).isNextDev) {
    it('should skip next deploy for now', () => {})
    return
  }

  if (process.env.NEXT_TEST_REACT_VERSION === '^17') {
    it('should skip for react v17', () => {})
    return
  }
  let next: NextInstance

  beforeAll(async () => {
    next = await createNext({
      files: new FileRef(path.join(__dirname, 'app-prefetch')),
      dependencies: {
        react: 'experimental',
        'react-dom': 'experimental',
      },
      skipStart: true,
    })
    await next.start()
  })
  afterAll(() => next.destroy())

  it('should show layout eagerly when prefetched with loading one level down', async () => {
    const browser = await webdriver(next.url, '/')
    // Ensure the page is prefetched
    await waitFor(1000)

    const before = Date.now()
    await browser
      .elementByCss('#to-dashboard')
      .click()
      .waitForElementByCss('#dashboard-layout')
    const after = Date.now()
    const timeToComplete = after - before

    expect(timeToComplete < 1000).toBe(true)

    expect(await browser.elementByCss('#dashboard-layout').text()).toBe(
      'Dashboard Hello World'
    )

    await browser.waitForElementByCss('#dashboard-page')

    expect(await browser.waitForElementByCss('#dashboard-page').text()).toBe(
      'Welcome to the dashboard'
    )
  })
})
