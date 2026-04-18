import { describe, it, expect } from 'vitest'
import { ApiError } from '@/types'

describe('ApiError', () => {
  describe('constructor', () => {
    it('sets the status property', () => {
      const err = new ApiError(404, 'Not found', '/api/missing')
      expect(err.status).toBe(404)
    })

    it('sets the body property', () => {
      const err = new ApiError(422, 'Unprocessable entity', '/api/items')
      expect(err.body).toBe('Unprocessable entity')
    })

    it('sets the url property', () => {
      const err = new ApiError(500, 'Server error', '/api/crash')
      expect(err.url).toBe('/api/crash')
    })

    it('sets message to "API Error <status>: <body>"', () => {
      const err = new ApiError(401, 'Unauthorized', '/api/admin')
      expect(err.message).toBe('API Error 401: Unauthorized')
    })

    it('sets name to "ApiError"', () => {
      const err = new ApiError(400, 'Bad request', '/api/foo')
      expect(err.name).toBe('ApiError')
    })

    it('works with status 0 for network errors', () => {
      const err = new ApiError(0, 'Error de conexión', '/api/down')
      expect(err.status).toBe(0)
      expect(err.body).toBe('Error de conexión')
      expect(err.message).toBe('API Error 0: Error de conexión')
    })
  })

  describe('instanceof checks', () => {
    it('is an instance of Error', () => {
      const err = new ApiError(500, 'Oops', '/api')
      expect(err).toBeInstanceOf(Error)
    })

    it('is an instance of ApiError', () => {
      const err = new ApiError(500, 'Oops', '/api')
      expect(err).toBeInstanceOf(ApiError)
    })

    it('can be caught as Error in a try/catch block', () => {
      let caught: unknown
      try {
        throw new ApiError(503, 'Service unavailable', '/api/service')
      } catch (e) {
        caught = e
      }
      expect(caught).toBeInstanceOf(Error)
      expect(caught).toBeInstanceOf(ApiError)
    })
  })

  describe('status codes', () => {
    it('preserves a 400 status', () => {
      expect(new ApiError(400, 'Bad', '/').status).toBe(400)
    })

    it('preserves a 401 status', () => {
      expect(new ApiError(401, 'Unauthorized', '/').status).toBe(401)
    })

    it('preserves a 403 status', () => {
      expect(new ApiError(403, 'Forbidden', '/').status).toBe(403)
    })

    it('preserves a 404 status', () => {
      expect(new ApiError(404, 'Not found', '/').status).toBe(404)
    })

    it('preserves a 500 status', () => {
      expect(new ApiError(500, 'Server error', '/').status).toBe(500)
    })

    it('preserves status 0 for network errors', () => {
      expect(new ApiError(0, 'Network fail', '/').status).toBe(0)
    })
  })
})
