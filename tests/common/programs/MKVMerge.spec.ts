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
import { Change } from '../../../src/common/Change'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { SpawnOptionsWithStdioTuple, StdioPipe } from 'child_process'
import {
  changeListToMap,
  getFakeAbsolutePath,
  simulateFileInfoResponse,
  simulateMKVmergeFailure,
  simulateProgramNotFound
} from '../testUtils'
import { Processes } from '../../../src/main/util/processes'
import { MKVMerge, MKVMERGE_ENGLISH } from '../../../src/main/domain/programs/MKVMerge'
import { Track } from '../../../src/main/domain/Track'
import { TrackType } from '../../../src/common/@types/Track'
import * as path from 'node:path'
import * as os from 'node:os'
import * as fs from 'node:fs'
import { Files } from '../../../src/main/util/files'

const genSpawnSpyFileInfo = (jsonFileName: string) =>
  vi
    .spyOn(Processes, 'spawn')
    .mockImplementation((): ChildProcessWithoutNullStreams => simulateFileInfoResponse(jsonFileName))

const genSpawnSpy = () =>
  vi.spyOn(Processes, 'spawn').mockImplementation((): ChildProcessWithoutNullStreams => {
    return {
      pid: 1234,
      on: (event, listener) => {
        if (event === 'close') {
          listener(0)
        }
      }
    } as unknown as ChildProcessWithoutNullStreams
  })
const genSpawnSpyWrongDataWrongWrongError = () =>
  vi.spyOn(Processes, 'spawn').mockImplementation((): ChildProcessWithoutNullStreams => {
    let dataListener = undefined
    let errorListener = undefined
    setImmediate(() => {
      dataListener('not understood line output.')
    })
    setImmediate(() => {
      const err: { code: string; path?: string; message: string } = {
        code: 'UNDEFINED',
        message: 'stranger than fiction'
      }
      errorListener(err)
    })

    return {
      pid: 1234,
      on: (event, listener) => {
        if (event === 'error') {
          errorListener = listener
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
  })

const genSpawnSpyWrongDataWrongWrongClose = () =>
  vi
    .spyOn(Processes, 'spawn')
    .mockImplementation(
      (
        _command: string,
        _args: readonly string[],
        _options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
      ): ChildProcessWithoutNullStreams => {
        let dataListener = undefined
        let closeListener = undefined
        setImmediate(() => {
          dataListener('not understood line output.')
        })
        setImmediate(() => {
          closeListener(3)
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
    )

const genSpawnSpyProgress = () =>
  vi
    .spyOn(Processes, 'spawn')
    .mockImplementation(
      (
        _command: string,
        _args: readonly string[],
        _options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
      ): ChildProcessWithoutNullStreams => {
        let dataListener = undefined
        let closeListener = undefined

        for (const ep of ['0%', '25%', '50%', '75%', '100%']) {
          setImmediate(() => {
            dataListener(`Progress: ${ep}`)
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
    )

test('MKVMerge Electric State File Info', async () => {
  const spy = genSpawnSpyFileInfo('mkvMergeInfoElectricState.json')
  const fullPath = 'C:\\Download\\something.mkv'
  const { tracks, container } = await MKVMerge.getInstance().retrieveFileInformation(fullPath)

  const spawnArgs = spy.mock.lastCall[1]
  const uiLangIdx = spawnArgs.indexOf('--ui-language')
  expect(uiLangIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[uiLangIdx + 1]).toBe(MKVMERGE_ENGLISH)

  expect(container.title).toBe('The Electric State')
  expect(container.type).toBe('Matroska')
  expect(container.attachments?.length).toBe(0)
  expect(container.durationSeconds).toBe(7709.92)

  const identifyIdx = spawnArgs.indexOf('-J')
  expect(identifyIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[identifyIdx + 1]).toBe(fullPath)

  expect(tracks.length).toBe(8)
  expect(tracks[0]).toStrictEqual(
    new Track(
      0,
      undefined,
      TrackType.VIDEO,
      'HEVC/H.265/MPEG-H',
      'und',
      {
        audioChannels: undefined,
        audioSamplingFrequency: undefined,
        bitRate: 1199909,
        frames: 185038,
        textSubtitles: undefined,
        videoDimensions: '1920x1080'
      },
      true,
      false,
      1156400719,
      7709.917
    )
  )
  expect(tracks[1]).toStrictEqual(
    new Track(
      1,
      undefined,
      TrackType.AUDIO,
      'E-AC-3',
      'fr',
      {
        audioChannels: 6,
        audioSamplingFrequency: 48000,
        bitRate: 768000,
        frames: 240935,
        textSubtitles: undefined,
        videoDimensions: undefined
      },
      true,
      false,
      740152320,
      7709.92
    )
  )
  expect(tracks[7]).toStrictEqual(
    new Track(
      7,
      'SDH',
      TrackType.SUBTITLES,
      'SubRip/SRT',
      'en',
      {
        audioChannels: undefined,
        audioSamplingFrequency: undefined,
        bitRate: 74,
        frames: 1947,
        textSubtitles: true,
        videoDimensions: undefined
      },
      false,
      false,
      70183,
      7510.042
    )
  )
})

test('MKVMerge Electric State File Info 2', async () => {
  genSpawnSpyFileInfo('mkvMergeInfoElectricState2.json')
  const fullPath = 'C:\\Download\\something.mkv'
  const { tracks, container } = await MKVMerge.getInstance().retrieveFileInformation(fullPath)

  expect(container.title).toBe('The Electric State')
  expect(container.type).toBe('Matroska')
  expect(container.attachments?.length).toBe(0)
  expect(tracks.length).toBe(8)
})

test('MKVMerge Fermer Gueule File Info', async () => {
  const spy = genSpawnSpyFileInfo('mkvMergeInfoFermerGueule.json')
  const fullPath = 'C:\\Download\\la-fermer.mkv'
  const { tracks, container } = await MKVMerge.getInstance().retrieveFileInformation(fullPath)

  const spawnArgs = spy.mock.lastCall[1]
  const uiLangIdx = spawnArgs.indexOf('--ui-language')
  expect(uiLangIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[uiLangIdx + 1]).toBe(MKVMERGE_ENGLISH)

  const identifyIdx = spawnArgs.indexOf('-J')
  expect(identifyIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[identifyIdx + 1]).toBe(fullPath)

  expect(container.title).toBe(undefined)
  expect(container.type).toBe('Matroska')
  expect(container.attachments?.length).toBe(0)
  expect(tracks.length).toBe(2)
  expect(tracks[0]).toStrictEqual(
    new Track(
      0,
      undefined,
      TrackType.VIDEO,
      'AVC/H.264/MPEG-4p10',
      undefined,
      {
        audioChannels: undefined,
        audioSamplingFrequency: undefined,
        bitRate: undefined,
        frames: undefined,
        textSubtitles: undefined,
        videoDimensions: '1920x1080'
      },
      true,
      false,
      undefined,
      5375.563
    )
  )
  expect(tracks[1]).toStrictEqual(
    new Track(
      1,
      undefined,
      TrackType.AUDIO,
      'AAC',
      'fr',
      {
        audioChannels: 2,
        audioSamplingFrequency: 48000,
        bitRate: undefined,
        frames: undefined,
        textSubtitles: undefined,
        videoDimensions: undefined
      },
      true,
      false,
      undefined,
      5375.616
    )
  )
})

test('MKVMerge Le Fils Du Cordonnier File Info', async () => {
  const spy = genSpawnSpyFileInfo('mkvMergeInfoLeFilsDuCordonnier.json')
  const fullPath = 'C:\\Download\\fils-du-cordonnier.mkv'
  const { tracks, container } = await MKVMerge.getInstance().retrieveFileInformation(fullPath)

  const spawnArgs = spy.mock.lastCall[1]
  const uiLangIdx = spawnArgs.indexOf('--ui-language')
  expect(uiLangIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[uiLangIdx + 1]).toBe(MKVMERGE_ENGLISH)

  const identifyIdx = spawnArgs.indexOf('-J')
  expect(identifyIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[identifyIdx + 1]).toBe(fullPath)

  expect(container.title).toBe(undefined)
  expect(container.type).toBe('AVI')
  expect(container.attachments?.length).toBe(0)
  expect(tracks.length).toBe(2)
  expect(tracks[0]).toStrictEqual(
    new Track(
      0,
      undefined,
      TrackType.VIDEO,
      'MPEG-4p2',
      undefined,
      {
        audioChannels: undefined,
        audioSamplingFrequency: undefined,
        bitRate: undefined,
        frames: undefined,
        textSubtitles: undefined,
        videoDimensions: '720x408'
      },
      undefined,
      undefined,
      undefined,
      undefined
    )
  )
  expect(tracks[1]).toStrictEqual(
    new Track(
      1,
      undefined,
      TrackType.AUDIO,
      'AC-3',
      undefined,
      {
        audioChannels: 2,
        audioSamplingFrequency: 48000,
        bitRate: undefined,
        frames: undefined,
        textSubtitles: undefined,
        videoDimensions: undefined
      },
      undefined,
      undefined,
      undefined,
      undefined
    )
  )
})

function isWindows() {
  return os.platform() === 'win32'
}

test('MKVMerge Input&Output&Language Arguments', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Files, 'mkdirSync').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')

  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, [])

  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const uiLangIdx = spawnArgs.indexOf('--ui-language')
  expect(uiLangIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[uiLangIdx + 1]).toBe(MKVMERGE_ENGLISH)

  const outputIdx = spawnArgs.indexOf('--output')
  expect(outputIdx).toBeGreaterThanOrEqual(0)
  expect(spawnArgs[outputIdx + 1]).toBe(outputPath + path.sep + 'something.mkv')

  const inputIdx = spawnArgs.indexOf('(')
  expect(inputIdx, 'input file not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[inputIdx + 1]).toBe(fullPath)
  expect(spawnArgs[inputIdx + 2]).toBe(')')
})

test('MKVMerge Progression data', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spawnSpy = genSpawnSpyProgress()
  const fullPath = 'C:\\Download\\something.mkv'
  const progresses: number[] = []
  await MKVMerge.getInstance().processFile(
    path.basename(fullPath),
    fullPath,
    '/tmp/Download/ReworkedTest',
    [],
    [],
    (progression) => {
      progresses.push(progression.progress)
    }
  )

  expect(spawnSpy).toHaveBeenCalled()
  expect(progresses).toStrictEqual([0, 0.25, 0.5, 0.75, 1])
})

test('MKVMerge Filename changed', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const changes = [
    {
      uuid: '7677df1b-2c25-4253-8ffd-39156f18ecd2',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: 'b9cb9d68-99d6-4125-af71-8c6d5b759ddf',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'und',
      newValue: 'en-US'
    },
    {
      uuid: '4d9c692a-7474-4cf5-817c-9024e456ce0c',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'VFF  DDP 5.1  640 kbps',
      newValue: 'VFF 5.1'
    },
    {
      uuid: '5774ea2c-1103-4da6-a4ec-a6ed06ecedad',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: '5af7b5ca-965e-49c9-8bf0-156731ffaf57',
      sourceType: 'Audio',
      trackId: 2,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'en',
      newValue: 'en-US'
    },
    {
      uuid: '429a547d-10a4-4ef5-a04c-89f732cb541d',
      sourceType: 'Audio',
      trackId: 2,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'VO  DDP 5.1 Atmos  768 kbps',
      newValue: 'VO 5.1'
    },
    {
      uuid: 'db3bede5-a40c-45e1-95df-d9f5cb1960b6',
      sourceType: 'Subtitles',
      trackId: 3,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'FR Forced',
      newValue: 'Forced'
    },
    {
      uuid: 'c37854be-0158-44b3-876e-00b7b4c19da5',
      sourceType: 'Subtitles',
      trackId: 3,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: 'a6996d4e-63c5-4910-9d34-04559a22ad3a',
      sourceType: 'Subtitles',
      trackId: 4,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'FR',
      newValue: 'Full'
    },
    {
      uuid: '9b210099-b962-4207-8d6b-dc2f52e4f866',
      sourceType: 'Subtitles',
      trackId: 5,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'en',
      newValue: 'en-US'
    },
    {
      uuid: 'c8f22f56-3f58-471d-8368-433651e4e7b8',
      sourceType: 'Subtitles',
      trackId: 5,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'ENG Forced',
      newValue: 'Forced'
    },
    {
      uuid: '0bcac42a-5d20-46aa-a7c1-92d6b0f063ee',
      sourceType: 'Subtitles',
      trackId: 6,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'en',
      newValue: 'en-US'
    },
    {
      uuid: '67fa8b37-bfab-4907-a5af-9ac57e8df59e',
      sourceType: 'Subtitles',
      trackId: 6,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'ENG',
      newValue: 'Full'
    },
    {
      uuid: '4a98799c-f5a9-489a-b0b0-6b4e1bd797db',
      sourceType: 'Container',
      changeType: 'Update',
      property: 'Filename',
      currentValue: 'Captain.America.Brave.New.World.2025.MULTi.VFF.1080p.WEBRip.DDP5.1.Atmos.HEVC-[PSA]-BATGirl.mkv',
      newValue: 'Captain America։ Brave New World (2025).mkv'
    },
    {
      uuid: '187b1ff1-c406-4f1f-bb26-568029b9ae1f',
      sourceType: 'Container',
      changeType: 'Attach',
      property: 'Poster Image',
      newValue: 'C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-QxfMkk\\TMDB-822119\\cover.jpg'
    }
  ] as Change[]
  const changesMap = changeListToMap(changes)

  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)

  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const outputIdx = spawnArgs.indexOf('--output')
  expect(outputIdx, '--output not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[outputIdx + 1]).toBe(outputPath + path.sep + changesMap['Container']['Update_Filename'].newValue)
})

test('Title changed', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const changes = [
    {
      uuid: 'add01bff-2fda-47df-aa92-8c53c920c383',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: '6472fc01-8f75-4b20-93b6-d1b70f393588',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'und',
      newValue: 'en'
    },
    {
      uuid: 'f2ae7ba5-2cfa-4dc1-96a2-3b9a8557300b',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'AAC VO',
      newValue: 'VO 5.1'
    },
    {
      uuid: '36e3812f-e136-4e3c-ac3a-458a25df1b0d',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: 'b2d83ae1-163a-472e-932a-3fe8e6cdf9a7',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'FANSUB FR',
      newValue: 'Full'
    },
    {
      uuid: 'da133966-b46f-42b1-9de5-9ba447b1fd73',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: '4212152d-eca8-4698-af03-0fd01dc376a7',
      sourceType: 'Subtitles',
      trackId: 3,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'FULL VO',
      newValue: 'Full'
    },
    {
      uuid: 'db2d40b6-fb73-419c-9ee7-17e1a31d2f52',
      sourceType: 'Container',
      changeType: 'Update',
      property: 'Filename',
      currentValue: 'A.Working.Man.2025.FANSUB.VOSTFR.1080p.10bit.WEBRip.6CH.x265.HEVC-Slay3R.mkv',
      newValue: 'A Working Man (2025).mkv'
    },
    {
      uuid: '09f8327a-0677-441b-82b2-47c0a54d517a',
      sourceType: 'Container',
      changeType: 'Attach',
      property: 'Poster Image',
      newValue:
        'C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-TXMU1k\\TMDB-1197306\\cover.jpg'
    },
    {
      uuid: '993b2898-4155-436d-8910-bc982f0cb8ac',
      sourceType: 'Container',
      changeType: 'Update',
      property: 'Title',
      currentValue: 'A Working Man (2025) by Slay3R',
      newValue: 'A Working Man (2025)'
    }
  ] as Change[]
  const changesMap = changeListToMap(changes)
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const titleIdx = spawnArgs.indexOf('--title')
  expect(titleIdx, '--title not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[titleIdx + 1]).toBe(changesMap['Container']['Update_Title'].newValue)
})

test('MKVMerge Provokes error', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Processes, 'spawn').mockImplementation(simulateMKVmergeFailure)
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await expect(
    MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, [])
  ).rejects.toThrowError("The file '-P' could not be opened for reading: open file error.")
})

test('MKVMerge Program not found', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  vi.spyOn(Processes, 'spawn').mockImplementation((cmd, args) => simulateProgramNotFound(cmd, args))
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await expect(
    MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, [])
  ).rejects.toThrowError(/Command "[^"]+" not found\./i)
})

test('Tags And Attachments updated', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const changes = [
    {
      uuid: '29062fbc-16b2-4bb6-bd70-25723e5aeec6',
      sourceType: 'Container',
      changeType: 'Delete',
      property: 'Tags'
    },
    {
      uuid: '29062fbc-16b2-4bb6-bd70-25723e5aeec1',
      sourceType: 'Container',
      changeType: 'Delete',
      property: 'Attachments'
    },
    {
      uuid: 'a97a5f9e-f722-4f3a-9584-208370b76635',
      sourceType: 'Container',
      changeType: 'Update',
      property: 'Poster Image',
      currentValue: {
        filename: 'cover.jpg',
        mimeType: 'image/jpeg',
        description: ''
      },
      newValue: {
        path: 'C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-BVytyg\\TMDB-124418\\cover.jpg',
        description: 'TMDB Poster https://image.tmdb.org/t/p/w1280/bH7kGBVR5d2T984reMaxsAnj6oJ.jpg',
        mimeType: 'image/jpeg',
        filename: 'cover.jpg'
      }
    }
  ] as Change[]
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  expect(spawnArgs.indexOf('--no-global-tags'), '--no-global-tags not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs.indexOf('--no-track-tags'), '--no-track-tags not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs.indexOf('--no-attachments'), '--no-attachments not found').toBeGreaterThanOrEqual(0)
  const attachmentNameIdx = spawnArgs.indexOf('--attachment-name')
  expect(attachmentNameIdx, '--attachment-name not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[attachmentNameIdx + 1]).toBe('cover.jpg')
  const attachmentDescriptionIdx = spawnArgs.indexOf('--attachment-description')
  expect(attachmentDescriptionIdx, '--attachment-description not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[attachmentDescriptionIdx + 1]).toBe(
    'TMDB Poster https://image.tmdb.org/t/p/w1280/bH7kGBVR5d2T984reMaxsAnj6oJ.jpg'
  )
  const attachmentMimeTypeIdx = spawnArgs.indexOf('--attachment-mime-type')
  expect(attachmentMimeTypeIdx, '--attachment-mime-type not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[attachmentMimeTypeIdx + 1]).toBe('image/jpeg')
  const attachFileIdx = spawnArgs.indexOf('--attach-file')
  expect(attachFileIdx, '--attach-file not found').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[attachFileIdx + 1]).toBe(
    'C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-BVytyg\\TMDB-124418\\cover.jpg'
  )
})

test('Track Properties updated', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const changes = [
    {
      uuid: '177eb9a5-db86-4143-a408-360603ac2c6b',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: 'd41c0a4a-95fa-4899-a23b-304ebb2cbbad',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'en',
      newValue: 'en-US'
    },
    {
      uuid: 'b72a4917-0145-4499-98ec-dc250d1f8afc',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Name',
      currentValue: 'VF 2.0',
      newValue: 'VFI 2.0'
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b5',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: true,
      newValue: false
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b2',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Forced',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-c4f8315068b2',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Language',
      currentValue: 'es',
      newValue: 'fr'
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068f4',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Name',
      currentValue: '',
      newValue: 'Forced FR'
    }
  ] as Change[]
  const fullPath = getFakeAbsolutePath('Download', 'savate.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const defaultIndexes = spawnArgs
    .map((arg, index) => (arg === '--default-track' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(defaultIndexes.length).toBe(2)
  expect(spawnArgs[defaultIndexes[0] + 1]).toBe('0:no')
  expect(spawnArgs[defaultIndexes[1] + 1]).toBe('1:no')

  const forcedIndexes = spawnArgs
    .map((arg, index) => (arg === '--forced-track' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(forcedIndexes.length).toBe(1)
  expect(spawnArgs[forcedIndexes[0] + 1]).toBe('2:yes')

  const namedIndexes = spawnArgs
    .map((arg, index) => (arg === '--track-name' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(namedIndexes.length).toBe(2)
  expect(spawnArgs[namedIndexes[0] + 1]).toBe('1:VFI 2.0')
  expect(spawnArgs[namedIndexes[1] + 1]).toBe('2:Forced FR')

  const languageIndexes = spawnArgs
    .map((arg, index) => (arg === '--language' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(languageIndexes.length).toBe(2)
  expect(spawnArgs[languageIndexes[0] + 1]).toBe('0:en-US')
  expect(spawnArgs[languageIndexes[1] + 1]).toBe('2:fr')
})

test('Track Properties updated 2', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const changes = [
    {
      uuid: '177eb9a5-db86-4143-a408-360603ac2c6b',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b5',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b2',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Forced',
      currentValue: true,
      newValue: false
    }
  ] as Change[]
  const fullPath = getFakeAbsolutePath('Download', 'savate.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const defaultIndexes = spawnArgs
    .map((arg, index) => (arg === '--default-track' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(defaultIndexes.length).toBe(2)
  expect(spawnArgs[defaultIndexes[0] + 1]).toBe('0:yes')
  expect(spawnArgs[defaultIndexes[1] + 1]).toBe('1:yes')

  const forcedIndexes = spawnArgs
    .map((arg, index) => (arg === '--forced-track' ? index : undefined))
    .filter((arg) => arg !== undefined)
  expect(forcedIndexes.length).toBe(1)
  expect(spawnArgs[forcedIndexes[0] + 1]).toBe('2:no')
})

test('Fake mkvmerge error output for coverage 1', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpyWrongDataWrongWrongClose()
  const changes = [
    {
      uuid: '177eb9a5-db86-4143-a408-360603ac2c6b',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b5',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b2',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Forced',
      currentValue: true,
      newValue: false
    }
  ] as Change[]
  const fullPath = getFakeAbsolutePath('Download', 'savate.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')

  try {
    await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
    expect.unreachable('This should not happen')
  } catch (error) {
    expect(error.message).toBe('Unexpected error.')
  }
  expect(spy).toHaveBeenCalled()
})

test('Fake mkvmerge error output for coverage 2', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpyWrongDataWrongWrongError()
  const changes = [
    {
      uuid: '177eb9a5-db86-4143-a408-360603ac2c6b',
      sourceType: 'Video',
      trackId: 0,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b5',
      sourceType: 'Audio',
      trackId: 1,
      changeType: 'Update',
      property: 'Default',
      currentValue: false,
      newValue: true
    },
    {
      uuid: 'ae1f7806-7f1f-4b18-ac29-d608315068b2',
      sourceType: 'Subtitles',
      trackId: 2,
      changeType: 'Update',
      property: 'Forced',
      currentValue: true,
      newValue: false
    }
  ] as Change[]
  const fullPath = getFakeAbsolutePath('Download', 'something.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  try {
    await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, changes)
    expect.unreachable('This should not happen')
  } catch (error) {
    expect(error.message).toBe('stranger than fiction')
  }
  expect(spy).toHaveBeenCalled()
})

test('Track Removed', async () => {
  vi.spyOn(Processes, 'setPriority').mockImplementation(vi.fn())
  const spy = genSpawnSpy()
  const tracks = [
    {
      id: 0,
      type: TrackType.VIDEO,
      copy: false
    },
    {
      id: 1,
      type: TrackType.AUDIO,
      copy: false
    },
    {
      id: 2,
      type: TrackType.SUBTITLES,
      copy: false
    }
  ] as Track[]
  const fullPath = getFakeAbsolutePath('Download', 'savate.mkv')
  const outputPath = getFakeAbsolutePath('Download', 'ReworkedTest')
  await MKVMerge.getInstance().processFile(path.basename(fullPath), fullPath, outputPath, [], tracks)
  expect(spy).toHaveBeenCalled()
  const spawnArgs = spy.mock.lastCall[1]
  const videoTracksOptionIdx = spawnArgs.indexOf('--video-tracks')
  expect(videoTracksOptionIdx, 'no --video-tracks option').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[videoTracksOptionIdx + 1]).toBe('!0')
  const audioTracksOptionIdx = spawnArgs.indexOf('--audio-tracks')
  expect(audioTracksOptionIdx, 'no --audio-tracks option').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[audioTracksOptionIdx + 1]).toBe('!1')
  const subtitlesTracksOptionIdx = spawnArgs.indexOf('--subtitle-tracks')
  expect(subtitlesTracksOptionIdx, 'no --subtitle-tracks option').toBeGreaterThanOrEqual(0)
  expect(spawnArgs[subtitlesTracksOptionIdx + 1]).toBe('!2')
})
