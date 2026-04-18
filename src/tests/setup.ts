/**
 * Global test setup for Vitest.
 *
 * - Stubs environment variables
 * - Suppresses console output by default (tests can opt-in with vi.restoreAllMocks())
 * - Clears sessionStorage between tests
 */

import { vi, beforeEach, afterEach } from 'vitest'

// Stub env vars for all tests
vi.stubEnv('VITE_API_URL', '')
vi.stubEnv('VITE_EVENT_NAME', 'Test Event')
vi.stubEnv('VITE_LOG_LEVEL', 'error') // suppress log noise in tests

// Suppress console output by default
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  sessionStorage.clear()

  // Re-stub env for next test
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('VITE_EVENT_NAME', 'Test Event')
  vi.stubEnv('VITE_LOG_LEVEL', 'error')
})
