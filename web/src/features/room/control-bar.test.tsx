import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ControlBar } from '@/features/room/control-bar'

describe('ControlBar', () => {
  it('fires handlers for mic, camera, screen, copy link, and leave', async () => {
    const onMicToggle = vi.fn()
    const onCameraToggle = vi.fn()
    const onScreenToggle = vi.fn()
    const onCopyLink = vi.fn()
    const onLeave = vi.fn()

    render(
      <ControlBar
        micEnabled
        cameraEnabled={false}
        screenEnabled={false}
        onMicToggle={onMicToggle}
        onCameraToggle={onCameraToggle}
        onScreenToggle={onScreenToggle}
        onCopyLink={onCopyLink}
        onLeave={onLeave}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /mic live/i }))
    await userEvent.click(screen.getByRole('button', { name: /camera off/i }))
    await userEvent.click(screen.getByRole('button', { name: /share screen/i }))
    await userEvent.click(screen.getByRole('button', { name: /copy link/i }))
    await userEvent.click(screen.getByRole('button', { name: /leave/i }))

    expect(onMicToggle).toHaveBeenCalledTimes(1)
    expect(onCameraToggle).toHaveBeenCalledTimes(1)
    expect(onScreenToggle).toHaveBeenCalledTimes(1)
    expect(onCopyLink).toHaveBeenCalledTimes(1)
    expect(onLeave).toHaveBeenCalledTimes(1)
  })
})
