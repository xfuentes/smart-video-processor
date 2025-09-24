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
import { simulateFFmpegProgression } from '../testUtils'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { Processes } from '../../../src/main/util/processes'
import { EncoderSettings } from '../../../src/common/@types/Encoding'
import { currentSettings } from '../../../src/main/domain/Settings'
import { FFmpeg } from '../../../src/main/domain/programs/FFmpeg'
import { Files } from '../../../src/main/util/files'

const genSpawnSpyProgress = () => vi.spyOn(Processes, 'spawn').mockImplementation(simulateFFmpegProgression)

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

test('FFmpeg Guadalupe mother of humanity progression', async () => {
  const encodedFile = '/tmp/encoded.mkv'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'makeTempFile').mockImplementation(() => encodedFile)
  genSpawnSpyProgress()
  const fullPath = 'C:\\Download\\something.mkv'
  const progresses: number[] = []
  currentSettings.isTestEncodingEnabled = true
  const result = await FFmpeg.getInstance().encodeFileInternal(
    fullPath,
    '/tmp/',
    6120,
    [],
    encoderSettings,
    undefined,
    undefined,
    ({ progress }) => {
      progresses.push(progress)
    }
  )
  expect(progresses).toStrictEqual([undefined, undefined, 0.1696, 0.4341333333333333, 0.7093333333333334, 0.9568, 1])
  expect(result).toContain(encodedFile)
})

test('FFmpeg Guadalupe mother of humanity progression two passes', async () => {
  const encodedFile = '/tmp/encoded.mkv'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'makeTempFile').mockImplementation(() => encodedFile)
  genSpawnSpyProgress()
  const fullPath = 'C:\\Download\\something.mkv'
  const progresses: number[] = []
  const xSpeeds: number[] = []
  currentSettings.isTestEncodingEnabled = true
  const result = await FFmpeg.getInstance().encodeFile(
    fullPath,
    '/tmp',
    6120,
    [],
    encoderSettings,
    ({ progress, xSpeed }) => {
      progresses.push(progress)
      xSpeeds.push(xSpeed)
    }
  )
  let lastProgress = -1
  for (const progress of progresses) {
    if (progress !== undefined) {
      expect(progress).toBeGreaterThanOrEqual(lastProgress)
      lastProgress = progress
    }
  }
  expect(lastProgress).toBe(1)
  expect(xSpeeds).toStrictEqual([
    undefined,
    undefined,
    0.508,
    1.24,
    1.93,
    2.49,
    2.56,
    undefined,
    undefined,
    0.508,
    1.24,
    1.93,
    2.49,
    2.56
  ])
  expect(result).toContain(encodedFile)
})

const recordedMarcelinoProgresses = [
  'frame=874\n' +
    'fps=0.0\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 919.8kbits/s\n' +
    'total_size=4014896\n' +
    'out_time_ms=34921000\n' +
    'out_time=00:00:34.921000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=69.8x\n' +
    'progress=continue\n',
  'frame=1964\n' +
    'fps=1962.8\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 877.4kbits/s\n' +
    'total_size=8611731\n' +
    'out_time_ms=78521000\n' +
    'out_time=00:01:18.521000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=78.5x\n' +
    'progress=continue\n',
  'frame=3030\n' +
    'fps=2019.1\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 886.3kbits/s\n' +
    'total_size=13423166\n' +
    'out_time_ms=121161000\n' +
    'out_time=00:02:01.161000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=80.7x\n' +
    'progress=continue\n',
  'frame=3917\n' +
    'fps=1957.0\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 894.5kbits/s\n' +
    'total_size=17513762\n' +
    'out_time_ms=156641000\n' +
    'out_time=00:02:36.641000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=78.3x\n' +
    'progress=continue\n',
  'frame=4900\n' +
    'fps=1958.1\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 904.5kbits/s\n' +
    'total_size=22155631\n' +
    'out_time_ms=195961000\n' +
    'out_time=00:03:15.961000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=78.3x\n' +
    'progress=continue\n',
  'frame=5948\n' +
    'fps=1980.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 909.3kbits/s\n' +
    'total_size=27038453\n' +
    'out_time_ms=237881000\n' +
    'out_time=00:03:57.881000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=79.2x\n' +
    'progress=continue\n',
  'frame=6899\n' +
    'fps=1969.1\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 907.0kbits/s\n' +
    'total_size=31282797\n' +
    'out_time_ms=275921000\n' +
    'out_time=00:04:35.921000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=78.8x\n' +
    'progress=continue\n',
  'frame=7619\n' +
    'fps=1903.0\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 903.9kbits/s\n' +
    'total_size=34428631\n' +
    'out_time_ms=304721000\n' +
    'out_time=00:05:04.721000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=76.1x\n' +
    'progress=continue\n',
  'frame=8373\n' +
    'fps=1858.0\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 914.0kbits/s\n' +
    'total_size=38259448\n' +
    'out_time_ms=334881000\n' +
    'out_time=00:05:34.881000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=74.3x\n' +
    'progress=continue\n',
  'frame=9341\n' +
    'fps=1865.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 906.4kbits/s\n' +
    'total_size=42329357\n' +
    'out_time_ms=373601000\n' +
    'out_time=00:06:13.601000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=74.6x\n' +
    'progress=continue\n',
  'frame=10135\n' +
    'fps=1840.5\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 910.4kbits/s\n' +
    'total_size=46131168\n' +
    'out_time_ms=405361000\n' +
    'out_time=00:06:45.361000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=73.6x\n' +
    'progress=continue\n',
  'frame=10937\n' +
    'fps=1820.8\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 913.1kbits/s\n' +
    'total_size=49929321\n' +
    'out_time_ms=437441000\n' +
    'out_time=00:07:17.441000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=72.8x\n' +
    'progress=continue\n',
  'frame=11964\n' +
    'fps=1838.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 914.0kbits/s\n' +
    'total_size=54673069\n' +
    'out_time_ms=478521000\n' +
    'out_time=00:07:58.521000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=73.5x\n' +
    'progress=continue\n',
  'frame=12919\n' +
    'fps=1843.6\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 911.0kbits/s\n' +
    'total_size=58844338\n' +
    'out_time_ms=516721000\n' +
    'out_time=00:08:36.721000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=73.7x\n' +
    'progress=continue\n',
  'frame=13856\n' +
    'fps=1845.5\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 913.2kbits/s\n' +
    'total_size=63259155\n' +
    'out_time_ms=554201000\n' +
    'out_time=00:09:14.201000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=73.8x\n' +
    'progress=continue\n',
  'frame=14734\n' +
    'fps=1839.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 914.7kbits/s\n' +
    'total_size=67381378\n' +
    'out_time_ms=589321000\n' +
    'out_time=00:09:49.321000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=73.6x\n' +
    'progress=continue\n',
  'frame=15800\n' +
    'fps=1856.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 908.0kbits/s\n' +
    'total_size=71730896\n' +
    'out_time_ms=631961000\n' +
    'out_time=00:10:31.961000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=74.3x\n' +
    'progress=continue\n',
  'frame=16876\n' +
    'fps=1872.9\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 909.2kbits/s\n' +
    'total_size=76712516\n' +
    'out_time_ms=675001000\n' +
    'out_time=00:11:15.001000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=74.9x\n' +
    'progress=continue\n',
  'frame=17896\n' +
    'fps=1881.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 914.8kbits/s\n' +
    'total_size=81849796\n' +
    'out_time_ms=715801000\n' +
    'out_time=00:11:55.801000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=75.3x\n' +
    'progress=continue\n',
  'frame=18820\n' +
    'fps=1880.0\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 915.7kbits/s\n' +
    'total_size=86164158\n' +
    'out_time_ms=752761000\n' +
    'out_time=00:12:32.761000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=75.2x\n' +
    'progress=continue\n',
  'frame=19942\n' +
    'fps=1897.2\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 916.7kbits/s\n' +
    'total_size=91399290\n' +
    'out_time_ms=797641000\n' +
    'out_time=00:13:17.641000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=75.9x\n' +
    'progress=continue\n',
  'frame=21017\n' +
    'fps=1908.7\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 911.8kbits/s\n' +
    'total_size=95812807\n' +
    'out_time_ms=840641000\n' +
    'out_time=00:14:00.641000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=76.3x\n' +
    'progress=continue\n',
  'frame=21940\n' +
    'fps=1905.9\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 912.3kbits/s\n' +
    'total_size=100078104\n' +
    'out_time_ms=877561000\n' +
    'out_time=00:14:37.561000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=76.2x\n' +
    'progress=continue\n',
  'frame=22878\n' +
    'fps=1906.5\n' +
    'stream_0_0_q=-1.0\n' +
    'bitrate= 916.3kbits/s\n' +
    'total_size=104811876\n' +
    'out_time_ms=915081000\n' +
    'out_time=00:15:15.081000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=76.3x\n' +
    'progress=end\n'
]

export const simulateFFmpegProgressionMarcelino = (): ChildProcessWithoutNullStreams => {
  let dataListener = undefined
  let closeListener = undefined

  for (const rp of recordedMarcelinoProgresses) {
    setImmediate(() => {
      dataListener(rp)
    })
  }
  setImmediate(() => {
    closeListener(0)
  })

  return {
    pid: 1234,
    on: (event, listener) => {
      if (event === 'close') {
        closeListener = listener
      }
    },
    stdout: {
      on: (event, listener) => {
        if (event === 'data') {
          dataListener = listener
        }
      }
    }
  } as unknown as ChildProcessWithoutNullStreams
}

const marcelinoEncoderSettings = [
  {
    trackId: 1,
    trackType: 'Audio',
    audioChannels: 2,
    bitrate: 128000,
    originalSize: 203669913,
    targetSize: 73462400,
    compressionPercent: 64
  }
] as EncoderSettings[]
test('FFmpeg Marcelino audio progression', async () => {
  const encodedFile = '/tmp/encoded.mkv'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'makeTempFile').mockImplementation(() => encodedFile)
  vi.spyOn(Processes, 'spawn').mockImplementation(simulateFFmpegProgressionMarcelino)
  const fullPath = 'C:\\Download\\something.mkv'
  const progresses: number[] = []
  currentSettings.isTestEncodingEnabled = true
  const result = await FFmpeg.getInstance().encodeFileInternal(
    fullPath,
    '/tmp',
    4591.4,
    [],
    marcelinoEncoderSettings,
    undefined,
    undefined,
    ({ progress }) => {
      progresses.push(progress)
    }
  )
  expect(progresses).toStrictEqual([
    undefined,
    undefined,
    1.1640333333333333,
    2.617366666666667,
    4.0387,
    5.2213666666666665,
    6.532033333333334,
    7.929366666666667,
    9.197366666666666,
    10.157366666666666,
    11.1627,
    12.453366666666666,
    13.512033333333333,
    14.581366666666666,
    15.950700000000001,
    17.224033333333335,
    18.473366666666667,
    19.644033333333333,
    21.065366666666666,
    22.50003333333333,
    23.860033333333334,
    25.092033333333333,
    26.588033333333332,
    28.021366666666665,
    29.252033333333333,
    1
  ])
  expect(result).toContain(encodedFile)
})
