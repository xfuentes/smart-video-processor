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

import { AudioSyncStatus } from '../../common/@types/Video'

export const SYNC_SAMPLE_RATE = 2000
const WINDOW_SECONDS = 40
const MAX_LAG_SECONDS = 60
const WINDOW_COUNT = 12
const MIN_INLIERS = 4
const INLIER_TOLERANCE_SECONDS = 0.03
const MAX_RESIDUAL_SLOPE = 0.005
const MAX_SYNCED_DRIFT_SECONDS = 0.1
// The usual speed ratios between the 23.976, 24 and 25 frames per second versions of a film.
const SPEED_RATIOS = [1, 25 / 23.976, 23.976 / 25, 25 / 24, 24 / 25]

export interface AudioSyncResult {
  status: AudioSyncStatus
  // Delay in milliseconds to apply to the tracks of the other file.
  delayMs: number
  // Factor to apply to the timestamps of the other file before the delay.
  speedRatio: number
}

export interface AudioSyncSource {
  path: string
  // Position of the audio track among the audio tracks of the file.
  audioIndex: number
  duration: number
}

export type AudioWindowReader = (
  path: string,
  audioIndex: number,
  startSeconds: number,
  durationSeconds: number
) => Promise<Float32Array>

type Point = { time: number; offset: number }
type Line = { slope: number; intercept: number; inliers: Point[] }

// In-place iterative radix-2 fast Fourier transform.
const fft = (re: Float64Array, im: Float64Array, inverse: boolean) => {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) {
      j ^= bit
    }
    j ^= bit
    if (i < j) {
      const tmpRe = re[i]
      re[i] = re[j]
      re[j] = tmpRe
      const tmpIm = im[i]
      im[i] = im[j]
      im[j] = tmpIm
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const angle = ((inverse ? 2 : -2) * Math.PI) / size
    const stepRe = Math.cos(angle)
    const stepIm = Math.sin(angle)
    const half = size >> 1
    for (let start = 0; start < n; start += size) {
      let wRe = 1
      let wIm = 0
      for (let k = 0; k < half; k++) {
        const a = start + k
        const b = a + half
        const tRe = re[b] * wRe - im[b] * wIm
        const tIm = re[b] * wIm + im[b] * wRe
        re[b] = re[a] - tRe
        im[b] = im[a] - tIm
        re[a] += tRe
        im[a] += tIm
        const nextRe = wRe * stepRe - wIm * stepIm
        wIm = wRe * stepIm + wIm * stepRe
        wRe = nextRe
      }
    }
  }
}

// Copies the samples without their mean and tells whether they contain any sound.
const loadCentered = (samples: Float32Array, target: Float64Array): boolean => {
  let mean = 0
  for (let i = 0; i < samples.length; i++) {
    mean += samples[i]
  }
  mean /= samples.length || 1
  let energy = 0
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i] - mean
    target[i] = value
    energy += value * value
  }
  return energy / (samples.length || 1) > 1e-9
}

// Returns the position of the reference inside the candidate, or undefined when one of them is silent.
export const findBestLag = (reference: Float32Array, candidate: Float32Array): number | undefined => {
  if (reference.length === 0 || candidate.length < reference.length) {
    return undefined
  }
  let size = 1
  while (size < reference.length + candidate.length) {
    size <<= 1
  }
  const refRe = new Float64Array(size)
  const refIm = new Float64Array(size)
  const candRe = new Float64Array(size)
  const candIm = new Float64Array(size)
  if (!loadCentered(reference, refRe) || !loadCentered(candidate, candRe)) {
    return undefined
  }
  fft(refRe, refIm, false)
  fft(candRe, candIm, false)
  for (let i = 0; i < size; i++) {
    const re = candRe[i] * refRe[i] + candIm[i] * refIm[i]
    const im = candIm[i] * refRe[i] - candRe[i] * refIm[i]
    candRe[i] = re
    candIm[i] = im
  }
  fft(candRe, candIm, true)
  let best = 0
  const maxLag = candidate.length - reference.length
  for (let lag = 1; lag <= maxLag; lag++) {
    if (candRe[lag] > candRe[best]) {
      best = lag
    }
  }
  return best
}

// Resamples with a linear interpolation so that the samples last ratio times longer.
const stretch = (samples: Float32Array, ratio: number): Float32Array => {
  if (ratio === 1) {
    return samples
  }
  const result = new Float32Array(Math.floor(samples.length * ratio))
  for (let i = 0; i < result.length; i++) {
    const position = i / ratio
    const index = Math.floor(position)
    const next = Math.min(index + 1, samples.length - 1)
    const fraction = position - index
    result[i] = samples[index] * (1 - fraction) + samples[next] * fraction
  }
  return result
}

const padTo = (samples: Float32Array, length: number): Float32Array => {
  if (samples.length === length) {
    return samples
  }
  const result = new Float32Array(length)
  result.set(samples.subarray(0, length))
  return result
}

const lineInliers = (points: Point[], slope: number, intercept: number): Point[] =>
  points.filter((p) => Math.abs(p.offset - (slope * p.time + intercept)) <= INLIER_TOLERANCE_SECONDS)

// Finds the line followed by the largest number of points, ignoring the outliers.
const fitLine = (points: Point[]): Line | undefined => {
  let best: Line | undefined = undefined
  const consider = (slope: number, intercept: number) => {
    if (Math.abs(slope) > MAX_RESIDUAL_SLOPE) {
      return
    }
    const inliers = lineInliers(points, slope, intercept)
    if (best === undefined || inliers.length > best.inliers.length) {
      best = { slope, intercept, inliers }
    }
  }
  for (let i = 0; i < points.length; i++) {
    consider(0, points[i].offset)
    for (let j = i + 1; j < points.length; j++) {
      const slope = (points[j].offset - points[i].offset) / (points[j].time - points[i].time)
      consider(slope, points[i].offset - slope * points[i].time)
    }
  }
  return best
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

// Measures where the audio of the main file is found in the other file, for one speed ratio.
const measurePoints = async (
  reader: AudioWindowReader,
  main: AudioSyncSource,
  other: AudioSyncSource,
  ratio: number,
  isCancelled: () => boolean
): Promise<Point[]> => {
  const points: Point[] = []
  const usable = Math.min(main.duration, other.duration * ratio) - WINDOW_SECONDS
  if (usable < WINDOW_SECONDS) {
    return points
  }
  const windowLength = WINDOW_SECONDS * SYNC_SAMPLE_RATE
  const searchLength = (WINDOW_SECONDS + 2 * MAX_LAG_SECONDS) * SYNC_SAMPLE_RATE
  for (let i = 0; i < WINDOW_COUNT && !isCancelled(); i++) {
    const time = usable * (0.05 + (0.9 * i) / (WINDOW_COUNT - 1))
    const otherStart = Math.max(0, (time - MAX_LAG_SECONDS) / ratio)
    const reference = await reader(main.path, main.audioIndex, time, WINDOW_SECONDS)
    const candidate = await reader(
      other.path,
      other.audioIndex,
      otherStart,
      (WINDOW_SECONDS + 2 * MAX_LAG_SECONDS) / ratio
    )
    const lag = findBestLag(padTo(reference, windowLength), padTo(stretch(candidate, ratio), searchLength))
    if (lag !== undefined) {
      points.push({ time, offset: time - ratio * otherStart - lag / SYNC_SAMPLE_RATE })
    }
  }
  return points
}

// Compares the audio of two versions of the same video to find the delay and the speed ratio between them.
export const measureAudioSync = async (
  reader: AudioWindowReader,
  main: AudioSyncSource,
  other: AudioSyncSource,
  isCancelled: () => boolean = () => false
): Promise<AudioSyncResult> => {
  const expectedRatio = other.duration > 0 ? main.duration / other.duration : 1
  const ratios = [...SPEED_RATIOS].sort((a, b) => Math.abs(a - expectedRatio) - Math.abs(b - expectedRatio))
  for (const ratio of ratios) {
    const points = await measurePoints(reader, main, other, ratio, isCancelled)
    if (isCancelled()) {
      break
    }
    const line = fitLine(points)
    if (line === undefined || line.inliers.length < Math.max(MIN_INLIERS, Math.ceil(points.length / 2))) {
      continue
    }
    const speedRatio = ratio / (1 - line.slope)
    if (Math.abs(speedRatio - 1) * main.duration <= MAX_SYNCED_DRIFT_SECONDS) {
      return { status: 'synced', delayMs: Math.round(median(line.inliers.map((p) => p.offset)) * 1000), speedRatio: 1 }
    }
    return { status: 'drift', delayMs: Math.round((line.intercept / (1 - line.slope)) * 1000), speedRatio }
  }
  return { status: 'unknown', delayMs: 0, speedRatio: 1 }
}
