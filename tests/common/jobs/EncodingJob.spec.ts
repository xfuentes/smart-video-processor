/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@hotmail.com>
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
import {
  getFakeAbsolutePath,
  JobStateChange,
  recordJobStates,
  simulateFFmpegFailure,
  simulateFFmpegProgression
} from '../testUtils'
import { EncoderSettings } from '../../../src/common/@types/Encoding'
import { Processes } from '../../../src/main/util/processes'
import { currentSettings } from '../../../src/main/domain/Settings'
import { EncodingJob } from '../../../src/main/domain/jobs/EncodingJob'
import { Files } from '../../../src/main/util/files'
import * as path from 'node:path'
import { Track } from '../../../src/main/domain/Track'

const encoderSettings = [
  {
    trackId: 0,
    trackType: 'Video',
    fps: 25,
    bitrate: 881280,
    originalSize: 6134295944,
    targetSize: 680238000,
    compressionPercent: 89
  },
  {
    trackId: 2,
    trackType: 'Audio',
    audioChannels: 2,
    bitrate: 128000,
    originalSize: 148199424,
    targetSize: 98799616,
    compressionPercent: 33
  },
  {
    trackId: 4,
    trackType: 'Audio',
    audioChannels: 2,
    bitrate: 128000,
    originalSize: 148199424,
    targetSize: 98799616,
    compressionPercent: 33
  }
] as EncoderSettings[]

const guadalupeTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'es-ES',
    properties: {
      videoDimensions: '720x576',
      frames: 154375,
      bitRate: 880642
    },
    default: false,
    forced: false,
    duration: 6175.021,
    size: 679748531
  },
  {
    id: 1,
    name: 'VFF 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr-FR',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 192968,
      bitRate: 384000
    },
    default: false,
    forced: false,
    duration: 6174.976,
    size: 296398848
  },
  {
    id: 2,
    name: 'VFF 2.0',
    type: 'Audio',
    codec: 'AAC',
    language: 'fr-FR',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 289453,
      bitRate: 130128
    },
    default: false,
    forced: false,
    duration: 6174.997,
    size: 100442733
  },
  {
    id: 3,
    name: 'VO 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'es-ES',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 192968,
      bitRate: 384000
    },
    default: false,
    forced: false,
    duration: 6174.976,
    size: 296398848
  },
  {
    id: 4,
    name: 'VO 2.0',
    type: 'Audio',
    codec: 'AAC',
    language: 'es-ES',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 289453,
      bitRate: 130041
    },
    default: false,
    forced: false,
    duration: 6174.997,
    size: 100375431
  },
  {
    id: 5,
    name: 'Full',
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    properties: {
      frames: 1250,
      bitRate: 8372
    },
    default: false,
    forced: false,
    duration: 5737.83,
    size: 6005350
  },
  {
    id: 6,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    properties: {
      frames: 1,
      bitRate: 1913
    },
    default: false,
    forced: true,
    duration: 4.949,
    size: 1184
  }
] as Track[]
test('Encoding Progression data', async () => {
  const encodedFile = '/tmp/encoded.mkv'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'makeTempFile').mockImplementation(() => encodedFile)
  const spawnSpy = vi.spyOn(Processes, 'spawn').mockImplementation(simulateFFmpegProgression)
  const fullPath = 'C:\\Download\\something.mkv'
  currentSettings.isTestEncodingEnabled = true
  const job: EncodingJob = new EncodingJob(fullPath, '/tmp', 6120, guadalupeTracks, encoderSettings)
  const stateChanges: JobStateChange[] = []
  recordJobStates(job, stateChanges)
  expect(job.finished).toBe(false)
  expect(job.success).toBe(false)
  const result = await job.queue()
  expect(job.finished).toBe(true)
  expect(job.success).toBe(true)

  expect(spawnSpy.mock.calls.length).toBe(2)
  // ### PASS 1
  let spawnArgs = spawnSpy.mock.calls[0][1]
  let progressIdx = spawnArgs.indexOf('-progress')
  expect(progressIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[progressIdx + 1]).toBe('pipe:1')

  let inputIdx = spawnArgs.indexOf('-i')
  expect(inputIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[inputIdx + 1]).toBe('C:\\Download\\something.mkv')

  let mapIdx = spawnArgs.indexOf('-map')
  expect(mapIdx, 'should map all streams by default').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[mapIdx + 1], 'should map video streams and no attachments by default').toBe('0:V')

  // ### PASS 2
  spawnArgs = spawnSpy.mock.calls[1][1]
  progressIdx = spawnArgs.indexOf('-progress')
  expect(progressIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[progressIdx + 1]).toBe('pipe:1')

  inputIdx = spawnArgs.indexOf('-i')
  expect(inputIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[inputIdx + 1]).toBe('C:\\Download\\something.mkv')

  mapIdx = spawnArgs.indexOf('-map')
  expect(mapIdx, 'should map all streams by default').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[mapIdx + 1], 'should map video streams and no attachments by default').toBe('0:V')

  const progresses: number[] = stateChanges.map((c) => c.progression.progress)
  let lastProgress = -1
  for (const progress of progresses.slice(0, progresses.length - 1)) {
    if (progress != undefined) {
      expect(progress).toBeGreaterThanOrEqual(lastProgress)
      lastProgress = progress
    }
  }
  expect(lastProgress).toBe(1)
  const xSpeeds: number[] = stateChanges.map((c) => c.progression.xSpeed)
  expect(xSpeeds).toStrictEqual([
    undefined,
    undefined,
    0.508,
    1.24,
    1.93,
    2.49,
    2.56,
    undefined,
    0.508,
    1.24,
    1.93,
    2.49,
    2.56,
    undefined
  ])
  expect(result).toContain(path.basename(encodedFile))
})

test('Failing Processing Job', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Processes, 'spawn').mockImplementation(simulateFFmpegFailure)
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const job: EncodingJob = new EncodingJob(fullPath, '/tmp', 30, [], encoderSettings)
  const stateChanges: JobStateChange[] = []
  recordJobStates(job, stateChanges)
  expect(job.started).toBe(false)
  expect(job.finished).toBe(false)
  expect(job.success).toBe(false)
  expect(job.processingOrPaused).toBe(false)
  try {
    await job.queue()
  } catch (err) {
    expect(err.message).toBe("Unrecognized option 'opt'.")
  }
  expect(job.processingOrPaused).toBe(false)
  expect(job.started).toBe(true)
  expect(job.failed).toBe(true)
  expect(job.success).toBe(false)
})
