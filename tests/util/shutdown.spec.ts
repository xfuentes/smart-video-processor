import { describe, expect, it } from 'vitest'
import { getShutdownCommand, getShutdownFallbackCommands } from '../../src/main/util/shutdown'

describe('shutdown', () => {
  describe('getShutdownCommand', () => {
    it('returns Windows shutdown command for win32', () => {
      expect(getShutdownCommand('win32')).toBe('shutdown /s /t 0')
    })

    it('returns macOS shutdown command for darwin', () => {
      expect(getShutdownCommand('darwin')).toBe('osascript -e \'tell application "System Events" to shut down\'')
    })

    it('returns Linux shutdown command for other platforms', () => {
      expect(getShutdownCommand('linux')).toBe('shutdown -h now')
      expect(getShutdownCommand('freebsd')).toBe('shutdown -h now')
    })
  })

  describe('getShutdownFallbackCommands', () => {
    it('returns no fallback for win32 and darwin', () => {
      expect(getShutdownFallbackCommands('win32')).toEqual([])
      expect(getShutdownFallbackCommands('darwin')).toEqual([])
    })

    it('returns fallbacks that ignore the inhibitors on Linux', () => {
      expect(getShutdownFallbackCommands('linux')).toEqual([
        'gnome-session-quit --power-off --no-prompt --force',
        'systemctl poweroff -i'
      ])
    })
  })
})
