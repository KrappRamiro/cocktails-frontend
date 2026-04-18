import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '@/stores/toastStore'

describe('useToastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('show()', () => {
    it('adds a toast with the correct message', () => {
      const store = useToastStore()
      store.show('Hello world')
      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Hello world')
    })

    it('adds a toast with the correct type when provided', () => {
      const store = useToastStore()
      store.show('Success!', 'success')
      expect(store.toasts[0].type).toBe('success')
    })

    it('defaults to type "info" when no type is provided', () => {
      const store = useToastStore()
      store.show('Info message')
      expect(store.toasts[0].type).toBe('info')
    })

    it('assigns a unique id to each toast', () => {
      const store = useToastStore()
      store.show('First')
      store.show('Second')
      const ids = store.toasts.map((t) => t.id)
      expect(ids[0]).not.toBe(ids[1])
    })
  })

  describe('max visible (3)', () => {
    it('allows up to 3 toasts simultaneously', () => {
      const store = useToastStore()
      store.show('One')
      store.show('Two')
      store.show('Three')
      expect(store.toasts).toHaveLength(3)
    })

    it('drops the oldest toast when a 4th is added', () => {
      const store = useToastStore()
      store.show('First')
      store.show('Second')
      store.show('Third')
      const firstId = store.toasts[0].id
      store.show('Fourth')
      expect(store.toasts).toHaveLength(3)
      expect(store.toasts.find((t) => t.id === firstId)).toBeUndefined()
    })

    it('the newest toast is always visible after overflow', () => {
      const store = useToastStore()
      store.show('First')
      store.show('Second')
      store.show('Third')
      store.show('Fourth')
      expect(store.toasts[store.toasts.length - 1].message).toBe('Fourth')
    })
  })

  describe('dismiss()', () => {
    it('removes the correct toast by id', () => {
      const store = useToastStore()
      store.show('Keep me')
      store.show('Remove me')
      const removeId = store.toasts[1].id
      store.dismiss(removeId)
      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].message).toBe('Keep me')
    })

    it('does not throw when dismissing a non-existent id', () => {
      const store = useToastStore()
      store.show('Some toast')
      expect(() => store.dismiss(99999)).not.toThrow()
      expect(store.toasts).toHaveLength(1)
    })

    it('leaves the list empty when the only toast is dismissed', () => {
      const store = useToastStore()
      store.show('Lone toast')
      const id = store.toasts[0].id
      store.dismiss(id)
      expect(store.toasts).toHaveLength(0)
    })
  })

  describe('auto-dismiss', () => {
    it('auto-dismisses an info toast after 3000ms (default)', () => {
      const store = useToastStore()
      store.show('Auto info')
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(2999)
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(store.toasts).toHaveLength(0)
    })

    it('auto-dismisses an error toast after 5000ms', () => {
      const store = useToastStore()
      store.show('Auto error', 'error')
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(4999)
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(store.toasts).toHaveLength(0)
    })

    it('respects a custom duration', () => {
      const store = useToastStore()
      store.show('Custom', 'info', 7000)
      vi.advanceTimersByTime(6999)
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(store.toasts).toHaveLength(0)
    })

    it('uses custom duration even for error type', () => {
      const store = useToastStore()
      store.show('Fast error', 'error', 1000)
      vi.advanceTimersByTime(999)
      expect(store.toasts).toHaveLength(1)
      vi.advanceTimersByTime(1)
      expect(store.toasts).toHaveLength(0)
    })

    it('auto-dismisses a success toast after 3000ms (default)', () => {
      const store = useToastStore()
      store.show('Done!', 'success')
      vi.advanceTimersByTime(3000)
      expect(store.toasts).toHaveLength(0)
    })

    it('does not remove a toast before its duration expires', () => {
      const store = useToastStore()
      store.show('Still here', 'info')
      vi.advanceTimersByTime(2000)
      expect(store.toasts).toHaveLength(1)
    })
  })
})
