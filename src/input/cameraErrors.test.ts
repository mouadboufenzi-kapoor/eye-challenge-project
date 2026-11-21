import { describe, expect, it } from 'vitest'
import { cameraErrorCode } from './cameraErrors'

describe('cameraErrorCode', () => {
  it('identifies permission errors', () => {
    expect(cameraErrorCode(new DOMException('blocked', 'NotAllowedError'))).toBe('CAMERA_DENIED')
  })

  it('identifies unavailable cameras', () => {
    expect(cameraErrorCode(new DOMException('missing', 'NotFoundError'))).toBe('CAMERA_UNAVAILABLE')
  })

  it('identifies unsupported constraints', () => {
    expect(cameraErrorCode(new DOMException('size', 'OverconstrainedError'))).toBe('CAMERA_CONSTRAINTS')
  })
})
