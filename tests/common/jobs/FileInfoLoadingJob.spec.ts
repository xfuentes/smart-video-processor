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

import { afterEach, expect, test, vi } from 'vitest'
import { ChildProcessWithoutNullStreams, SpawnOptionsWithStdioTuple, StdioPipe } from 'node:child_process'
import {
  cleanTmpFiles,
  JobStateChange,
  recordJobStates,
  registerTmpFiles,
  simulateFileInfoResponse,
  simulateMKVMergeProgression
} from '../testUtils'
import { Processes } from '../../../src/main/util/processes'
import { FFprobe } from '../../../src/main/domain/programs/FFprobe'
import { Files } from '../../../src/main/util/files'
import * as fs from 'node:fs'
import { FileInfoLoadingJob } from '../../../src/main/domain/jobs/FileInfoLoadingJob'
import { TrackType } from '../../../src/common/@types/Track'
import { JobStatus } from '../../../src/common/@types/Job'
import { MKVMERGE_ENGLISH } from '../../../src/main/domain/programs/MKVMerge'

const genSpawnSpyFileInfo = (origPath: string, origJsonFileName: string, processedJsonFileName: string) =>
  vi
    .spyOn(Processes, 'spawn')
    .mockImplementation(
      (
        _command: string,
        args: readonly string[],
        _options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
      ): ChildProcessWithoutNullStreams => {
        if (args.indexOf('-J') >= 0) {
          if (args.indexOf(origPath) >= 0) {
            return simulateFileInfoResponse(origJsonFileName)
          }
          return simulateFileInfoResponse(processedJsonFileName)
        }
        return simulateMKVMergeProgression()
      }
    )

afterEach(() => {
  cleanTmpFiles()
})

test('Job Fermer Gueule Info', async () => {
  registerTmpFiles()
  const origPath = 'C:\\Download\\original.mkv'
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpyFileInfo(origPath, 'mkvMergeInfoFermerGueule.json', 'mkvMergeInfoFermerGueuleProcessed.json')
  let lastFileDeleted: string = undefined
  vi.spyOn(FFprobe.getInstance(), 'completeFileInformation').mockImplementation(() => Promise.resolve())
  vi.spyOn(Files, 'unlinkSync').mockImplementation((path) => {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path)
    }
    lastFileDeleted = path.toString()
  })
  const job: FileInfoLoadingJob = new FileInfoLoadingJob(origPath)
  const stateChanges: JobStateChange[] = []
  recordJobStates(job, stateChanges)
  expect(job.finished).toBe(false)
  expect(job.success).toBe(false)
  const { tracks, container } = await job.queue()
  expect(job.finished).toBe(true)
  expect(job.success).toBe(true)

  const spawnArgs = spy.mock.lastCall[1]
  const uiLangIdx = spawnArgs.indexOf('--ui-language')
  expect(uiLangIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[uiLangIdx + 1]).toBe(MKVMERGE_ENGLISH)

  expect(container.title).toBe(undefined)
  expect(container.type).toBe('Matroska')
  expect(container.attachments?.length).toBe(0)
  expect(tracks.length).toBe(2)
  expect(tracks[0].type).toBe(TrackType.VIDEO)
  expect(tracks[0].codec).toBe('AVC/H.264/MPEG-4p10')
  expect(tracks[0].language).toBe('und')
  expect(tracks[0].properties.bitRate).toBe(3987485)
  expect(tracks[0].properties.frames).toBe(134388)
  expect(tracks[0].properties.videoDimensions).toBe('1920x1080')
  expect(tracks[0].properties.fps).toBe(25)
  expect(tracks[0].default).toBe(true)
  expect(tracks[0].forced).toBe(false)
  expect(tracks[0].size).toBe(2679351311)
  expect(tracks[0].duration).toBe(5375.52)
  expect(tracks[1].type).toBe(TrackType.AUDIO)
  expect(tracks[1].codec).toBe('AAC')
  expect(tracks[1].language).toBe('fr')
  expect(tracks[1].properties.bitRate).toBe(192000)
  expect(tracks[1].properties.frames).toBe(251982)
  expect(tracks[1].properties.audioChannels).toBe(2)
  expect(tracks[1].properties.audioSamplingFrequency).toBe(48000)
  expect(tracks[1].properties.fps).toBeUndefined()
  expect(tracks[1].default).toBe(true)
  expect(tracks[1].forced).toBe(false)
  expect(tracks[1].size).toBe(129014785)
  expect(tracks[1].duration).toBe(5375.616)

  expect(stateChanges.length).toBe(8)
  expect(stateChanges[0].status).toBe(JobStatus.QUEUED)
  expect(stateChanges[0].progression.progress).toBe(undefined)
  expect(stateChanges[1].status).toBe(JobStatus.LOADING)
  expect(stateChanges[1].progression.progress).toBe(undefined)
  const progresses: number[] = stateChanges.map((c) => c.progression.progress)
  expect(progresses).toStrictEqual([undefined, undefined, 0, 0.25, 0.5, 0.75, 1, -1])
  expect(stateChanges[7].status).toBe(JobStatus.SUCCESS)
  expect(stateChanges[7].progression.progress).toBe(-1)
  expect(tracks).toStrictEqual(job.getResult().tracks)
  expect(container).toStrictEqual(job.getResult().container)
  expect(lastFileDeleted.indexOf('.pre-process')).toBeGreaterThanOrEqual(0)
})
