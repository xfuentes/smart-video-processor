/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { expect, test, vi } from 'vitest'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { Processes } from '../../../src/main/util/processes'
import { FFprobe } from '../../../src/main/domain/programs/FFprobe'
import { Track } from '../../../src/main/domain/Track'
import { TrackType } from '../../../src/common/@types/Track'
import { Container } from '../../../src/main/domain/programs/MKVMerge'

const simulateFFprobeResponse = (json: unknown): ChildProcessWithoutNullStreams => {
  let dataListener: ((...args: unknown[]) => void) | undefined = undefined
  let closeListener: ((...args: unknown[]) => void) | undefined = undefined
  setImmediate(() => {
    dataListener?.(JSON.stringify(json))
  })
  setImmediate(() => {
    closeListener?.(0)
  })
  return {
    pid: 1234,
    on: (event: string, listener: (...args: unknown[]) => void) => {
      if (event === 'close') {
        closeListener = listener
      }
    },
    stdout: {
      on: (event: string, listener: (...args: unknown[]) => void) => {
        if (event === 'data') {
          dataListener = listener
        }
      }
    }
  } as unknown as ChildProcessWithoutNullStreams
}

test('FFprobe flags mov_text subtitle tracks as unsupported (Matroska cannot store them as-is)', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Processes, 'spawn').mockImplementation(() =>
    simulateFFprobeResponse({
      format: { duration: '100.0' },
      streams: [
        { index: 2, codec_name: 'mov_text', codec_long_name: 'MOV text' },
        { index: 3, codec_name: 'subrip', codec_long_name: 'SubRip subtitle' }
      ]
    })
  )

  // mkvmerge was able to read both tracks fine, so neither is flagged unsupported yet.
  const movTextTrack = new Track(2, '', TrackType.SUBTITLES, 'MPEG-4 Timed Text', undefined, {}, false, false, 0, 0)
  const srtTrack = new Track(3, '', TrackType.SUBTITLES, 'SubRip/SRT', undefined, {}, false, false, 0, 0)
  const tracks = [movTextTrack, srtTrack]
  const container: Container = { type: 'Matroska', tagCount: 0, durationSeconds: 0 }

  await FFprobe.getInstance().completeFileInformation('/tmp/issue17.mp4', tracks, container)

  expect(movTextTrack.unsupported).toBe(true)
  expect(srtTrack.unsupported).toBe(false)
})
