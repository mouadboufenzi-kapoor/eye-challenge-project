export type CameraErrorCode =
  | 'CAMERA_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'CAMERA_CONSTRAINTS'
  | 'CAMERA_UNSUPPORTED'

export function cameraErrorCode(error: unknown): CameraErrorCode {
  if (!(error instanceof DOMException)) return 'CAMERA_DENIED'

  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'CAMERA_DENIED'
    case 'NotFoundError':
    case 'AbortError':
    case 'NotReadableError':
      return 'CAMERA_UNAVAILABLE'
    case 'OverconstrainedError':
      return 'CAMERA_CONSTRAINTS'
    default:
      return 'CAMERA_DENIED'
  }
}
