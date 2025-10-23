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
import * as path from 'node:path'
import { IVideo } from "../../../src/common/@types/Video";
import { Track } from "../../../src/main/domain/Track";
import { ITrack } from "../../../src/common/@types/Track";

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
  expect(result).toContain(path.basename(encodedFile))
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
  expect(result).toContain(path.basename(encodedFile))
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
  expect(result).toContain(path.basename(encodedFile))
})

const recordedMarcelinoSnapshotProgresses = [
  'frame=1\n' +
    'fps=0.00\n' +
    'stream_0_0_q=-0.0\n' +
    'bitrate=N/A\n' +
    'total_size=N/A\n' +
    'out_time_us=40000\n' +
    'out_time_ms=40000\n' +
    'out_time=00:00:00.040000\n' +
    'dup_frames=0\n' +
    'drop_frames=0\n' +
    'speed=0.0529x\n' +
    'progress=end'
]

export const simulateFFmpegSnapshotProgressionMarcelino = (): ChildProcessWithoutNullStreams => {
  let dataListener = undefined
  let closeListener = undefined

  for (const rp of recordedMarcelinoSnapshotProgresses) {
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

test('FFmpeg Snapshot Marcelino', async () => {
  const snapshotsFile = '/tmp/12345-snapshots.png'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'makeTempFile').mockImplementation(() => snapshotsFile)
  vi.spyOn(Processes, 'spawn').mockImplementation(simulateFFmpegSnapshotProgressionMarcelino)
  const sourceFullPath = '/home/xfuentes/Vidéos/Marcellino (1991).1080p.h264 {tmdb-103715}.mkv'
  const progresses: number[] = []
  currentSettings.isTestEncodingEnabled = true
  const result = await FFmpeg.getInstance().generateSnapshots(
    sourceFullPath,
    '/tmp',
    64,
    114,
    2000,
    5400,
    ({ progress }) => {
      progresses.push(progress)
    }
  )
  expect(progresses).toStrictEqual([undefined, 1])
  expect(result).toContain(path.basename(snapshotsFile))
})


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
] as ITrack[]

test('FFmpeg Generate Processing Arguments main trim start', async () => {
  const result = FFmpeg.getInstance().generateProcessingArguments({
    startFrom: 600,
    videoParts: [],
    tracks: guadalupeTracks
  } as IVideo)
  expect(result).toContain("-filter_complex")
  const filterValue = result[result.indexOf("-filter_complex") + 1]
  const filters = filterValue.split(";");
  expect(filters.length).toStrictEqual(guadalupeTracks.length)
  expect(filters[0]).toStrictEqual("[0:v:0]trim=start=600,setpts=PTS-STARTPTS[v0_0]")
  expect(filters[1]).toStrictEqual("[0:a:0]atrim=start=600,asetpts=PTS-STARTPTS[a0_0]")
  expect(filters[2]).toStrictEqual("[0:a:1]atrim=start=600,asetpts=PTS-STARTPTS[a0_1]")
  expect(filters[3]).toStrictEqual("[0:a:2]atrim=start=600,asetpts=PTS-STARTPTS[a0_2]")
  expect(filters[4]).toStrictEqual("[0:a:3]atrim=start=600,asetpts=PTS-STARTPTS[a0_3]")
  expect(filters[5]).toStrictEqual("[0:s:0]trim=start=600,setpts=PTS-STARTPTS[s0_0]")
  expect(filters[6]).toStrictEqual("[0:s:1]trim=start=600,setpts=PTS-STARTPTS[s0_1]")
})

test('FFmpeg Generate Processing Arguments main trim end', async () => {
  const result = FFmpeg.getInstance().generateProcessingArguments({
    endAt: 6000,
    videoParts: [],
    tracks: guadalupeTracks
  } as IVideo)
  expect(result).toContain("-filter_complex")
  const filterValue = result[result.indexOf("-filter_complex") + 1]
  const filters = filterValue.split(";");
  expect(filters.length).toStrictEqual(guadalupeTracks.length)
  expect(filters[0]).toStrictEqual("[0:v:0]trim=end=6000,setpts=PTS-STARTPTS[v0_0]")
  expect(filters[1]).toStrictEqual("[0:a:0]atrim=end=6000,asetpts=PTS-STARTPTS[a0_0]")
  expect(filters[2]).toStrictEqual("[0:a:1]atrim=end=6000,asetpts=PTS-STARTPTS[a0_1]")
  expect(filters[3]).toStrictEqual("[0:a:2]atrim=end=6000,asetpts=PTS-STARTPTS[a0_2]")
  expect(filters[4]).toStrictEqual("[0:a:3]atrim=end=6000,asetpts=PTS-STARTPTS[a0_3]")
  expect(filters[5]).toStrictEqual("[0:s:0]trim=end=6000,setpts=PTS-STARTPTS[s0_0]")
  expect(filters[6]).toStrictEqual("[0:s:1]trim=end=6000,setpts=PTS-STARTPTS[s0_1]")
})

test('FFmpeg Generate Processing Arguments main trim start+end', async () => {
  const result = FFmpeg.getInstance().generateProcessingArguments({
    startFrom: 600,
    endAt: 6000,
    videoParts: [],
    tracks: guadalupeTracks
  } as IVideo)
  expect(result).toContain("-filter_complex")
  const filterValue = result[result.indexOf("-filter_complex") + 1]
  const filters = filterValue.split(";");
  expect(filters.length).toStrictEqual(guadalupeTracks.length)
  expect(filters[0]).toStrictEqual("[0:v:0]trim=start=600:end=6000,setpts=PTS-STARTPTS[v0_0]")
  expect(filters[1]).toStrictEqual("[0:a:0]atrim=start=600:end=6000,asetpts=PTS-STARTPTS[a0_0]")
  expect(filters[2]).toStrictEqual("[0:a:1]atrim=start=600:end=6000,asetpts=PTS-STARTPTS[a0_1]")
  expect(filters[3]).toStrictEqual("[0:a:2]atrim=start=600:end=6000,asetpts=PTS-STARTPTS[a0_2]")
  expect(filters[4]).toStrictEqual("[0:a:3]atrim=start=600:end=6000,asetpts=PTS-STARTPTS[a0_3]")
  expect(filters[5]).toStrictEqual("[0:s:0]trim=start=600:end=6000,setpts=PTS-STARTPTS[s0_0]")
  expect(filters[6]).toStrictEqual("[0:s:1]trim=start=600:end=6000,setpts=PTS-STARTPTS[s0_1]")
})

test('FFmpeg Generate Processing Arguments main trim end + second part start + concat', async () => {
  const result = FFmpeg.getInstance().generateProcessingArguments({
    endAt: 6000,
    videoParts: [
      {
        startFrom: 600,
        tracks: guadalupeTracks
      } as IVideo
    ],
    tracks: guadalupeTracks
  } as IVideo)
  expect(result).toContain("-filter_complex")
  const filterValue = result[result.indexOf("-filter_complex") + 1]
  const filters = filterValue.split(";");
  expect(filters.length).toStrictEqual(guadalupeTracks.length * 2 +1)
  expect(filters[0]).toStrictEqual("[0:v:0]trim=end=6000,setpts=PTS-STARTPTS[v0_0]")
  expect(filters[1]).toStrictEqual("[1:v:0]trim=start=600,setpts=PTS-STARTPTS[v1_0]")
  expect(filters[2]).toStrictEqual("[0:a:0]atrim=end=6000,asetpts=PTS-STARTPTS[a0_0]")
  expect(filters[3]).toStrictEqual("[1:a:0]atrim=start=600,asetpts=PTS-STARTPTS[a1_0]")
  expect(filters[4]).toStrictEqual("[0:a:1]atrim=end=6000,asetpts=PTS-STARTPTS[a0_1]")
  expect(filters[5]).toStrictEqual("[1:a:1]atrim=start=600,asetpts=PTS-STARTPTS[a1_1]")
  expect(filters[6]).toStrictEqual("[0:a:2]atrim=end=6000,asetpts=PTS-STARTPTS[a0_2]")
  expect(filters[7]).toStrictEqual("[1:a:2]atrim=start=600,asetpts=PTS-STARTPTS[a1_2]")
  expect(filters[8]).toStrictEqual("[0:a:3]atrim=end=6000,asetpts=PTS-STARTPTS[a0_3]")
  expect(filters[9]).toStrictEqual("[1:a:3]atrim=start=600,asetpts=PTS-STARTPTS[a1_3]")
  expect(filters[10]).toStrictEqual("[0:s:0]trim=end=6000,setpts=PTS-STARTPTS[s0_0]")
  expect(filters[11]).toStrictEqual("[1:s:0]trim=start=600,setpts=PTS-STARTPTS[s1_0]")
  expect(filters[12]).toStrictEqual("[0:s:1]trim=end=6000,setpts=PTS-STARTPTS[s0_1]")
  expect(filters[13]).toStrictEqual("[1:s:1]trim=start=600,setpts=PTS-STARTPTS[s1_1]")
  expect(filters[14]).toStrictEqual("[v0_0][a0_0][a0_1][a0_2][a0_3][s0_0][s0_1]" +
    "[v1_0][a1_0][a1_1][a1_2][a1_3][s1_0][s1_1]" +
    "concat=n=2:v=1:a=4:s=2[outv_0][outa_0][outa_1][outa_2][outa_3][outs_0][outs_1]")
})
