export function exactDeviceId(
  deviceId: string | null | undefined
): MediaTrackConstraints['deviceId'] {
  return isConcreteDeviceId(deviceId) ? { exact: deviceId } : undefined
}

export function normalizePreferredDeviceId(deviceId: unknown): string | null {
  return typeof deviceId === 'string' && isConcreteDeviceId(deviceId) ? deviceId : null
}

function isConcreteDeviceId(deviceId: string | null | undefined): deviceId is string {
  if (!deviceId) {
    return false
  }

  // Старые версии UI сохраняли synthetic ids для placeholder-устройств.
  // В getUserMedia их нельзя передавать как exact deviceId: браузер таких устройств не знает.
  return (
    deviceId !== 'default' && deviceId !== 'default-camera' && deviceId !== 'default-microphone'
  )
}
