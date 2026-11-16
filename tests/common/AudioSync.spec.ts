/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { expect, test } from 'vitest'
import { AudioWindowReader, findBestLag, measureAudioSync, SYNC_SAMPLE_RATE } from '../../src/main/domain/AudioSync'

const DURATION = 1200

// Deterministic noise, so that the tests always run on the same signal.
const noise = (seconds: number, seed: number): Float32Array => {
  const samples = new Float32Array(seconds * SYNC_SAMPLE_RATE)
  let state = seed
  for (let i = 0; i < samples.length; i++) {
    state = (state * 1664525 + 1013904223) >>> 0
    samples[i] = state / 2 ** 31 - 1
  }
  return samples
}

// Serves windows of a signal as if it was read from a file, with silence outside of it.
const readerOf = (signals: Record<string, (time: number) => number>): AudioWindowReader => {
  return async (path, _audioIndex, startSeconds, durationSeconds) => {
    const window = new Float32Array(Math.round(durationSeconds * SYNC_SAMPLE_RATE))
    for (let i = 0; i < window.length; i++) {
      window[i] = signals[path](startSeconds + i / SYNC_SAMPLE_RATE)
    }
    return window
  }
}

const sampleAt = (signal: Float32Array) => (time: number) => {
  const position = time * SYNC_SAMPLE_RATE
  const index = Math.floor(position)
  if (index < 0 || index + 1 >= signal.length) {
    return 0
  }
  const fraction = position - index
  return signal[index] * (1 - fraction) + signal[index + 1] * fraction
}

test('The position of a sound inside a longer one is found', () => {
  const signal = noise(10, 1)
  const reference = signal.slice(3 * SYNC_SAMPLE_RATE, 5 * SYNC_SAMPLE_RATE)
  expect(findBestLag(reference, signal)).toBe(3 * SYNC_SAMPLE_RATE)
  expect(findBestLag(new Float32Array(100), signal)).toBeUndefined()
})

test('A constant delay between two files is measured', async () => {
  const film = sampleAt(noise(DURATION, 2))
  const reader = readerOf({ main: film, other: (time) => film(time + 0.96) })
  const result = await measureAudioSync(
    reader,
    { path: 'main', audioIndex: 0, duration: DURATION },
    { path: 'other', audioIndex: 0, duration: DURATION }
  )
  expect(result).toStrictEqual({ status: 'synced', delayMs: 960, speedRatio: 1 })
})

test('A file starting later than the main one gets a negative delay', async () => {
  const film = sampleAt(noise(DURATION, 3))
  const reader = readerOf({ main: film, other: (time) => film(time - 12.5) })
  const result = await measureAudioSync(
    reader,
    { path: 'main', audioIndex: 0, duration: DURATION },
    { path: 'other', audioIndex: 0, duration: DURATION }
  )
  expect(result).toStrictEqual({ status: 'synced', delayMs: -12500, speedRatio: 1 })
})

test('A PAL speed-up is reported as a drift with its speed ratio', async () => {
  const ratio = 25 / 23.976
  const film = sampleAt(noise(DURATION, 4))
  const reader = readerOf({ main: film, other: (time) => film(time * ratio - 0.5) })
  const result = await measureAudioSync(
    reader,
    { path: 'main', audioIndex: 0, duration: DURATION },
    { path: 'other', audioIndex: 0, duration: DURATION / ratio }
  )
  expect(result.status).toBe('drift')
  expect(result.speedRatio).toBeCloseTo(ratio, 4)
  expect(Math.abs(result.delayMs + 500)).toBeLessThanOrEqual(5)
})

test('Unrelated files are reported as unknown', async () => {
  const reader = readerOf({ main: sampleAt(noise(DURATION, 5)), other: sampleAt(noise(DURATION, 6)) })
  const result = await measureAudioSync(
    reader,
    { path: 'main', audioIndex: 0, duration: DURATION },
    { path: 'other', audioIndex: 0, duration: DURATION }
  )
  expect(result).toStrictEqual({ status: 'unknown', delayMs: 0, speedRatio: 1 })
}, 60000)
