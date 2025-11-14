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

import { expect, test } from 'vitest'
import { SubtitlesType } from '../../src/common/SubtitlesType'
import { changeListToMap, getFakeAbsolutePath, hintListToMap } from './testUtils'
import { Attachment, ChangeProperty } from '../../src/common/Change'
import { Track } from '../../src/main/domain/Track'
import { Brain } from '../../src/main/domain/Brain'
import { Languages } from '../../src/common/LanguageIETF'
import { currentSettings } from '../../src/main/domain/Settings'
import { Countries } from '../../src/common/Countries'
import { HintType } from '../../src/common/@types/Hint'
import { Hint } from '../../src/main/domain/Hint'

const defaultPoster1: Attachment = {
  filename: 'cover.jpg',
  description: 'TMDB Poster /rgjrjgsdjdfsl.jpg',
  mimeType: 'image/jpeg',
  path: getFakeAbsolutePath('images', 'poster.jpg')
}

const questOfFireTracks = [
  {
    id: 0,
    name: 'HDLight',
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x816',
      frames: 144802,
      bitRate: 2998319
    },
    default: true,
    forced: false,
    duration: 6039,
    pathExtracted: '',
    size: 2263524767,
    tasks: []
  },
  {
    id: 1,
    name: 'FR VOF : AC3 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 188730,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 6039,
    size: 338204160
  }
] as Track[]
test('Analysis of Quest for Fire', () => {
  const results = Brain.getInstance().analyse(
    questOfFireTracks,
    getFakeAbsolutePath('Download', 'quest-fire.mkv'),
    'Quest of Fire',
    defaultPoster1,
    'Quest of Fire By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Video 0']['Update_Name']?.currentValue).toBe('HDLight')
  expect(changes['Video 0']['Update_Name']?.newValue).toBe('')
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)
  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('FR VOF : AC3 5.1')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 5.1')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
})

const nobodyHasToKnowTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x804',
      frames: 142968,
      bitRate: 9942003
    },
    default: true,
    forced: false,
    duration: 5957,
    pathExtracted: '',
    size: 7403064381,
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 558469,
      bitRate: 3184535
    },
    default: true,
    forced: false,
    duration: 5957,
    pathExtracted: '',
    size: 2371286096,
    tasks: []
  },
  {
    id: 2,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 558469,
      bitRate: 3252100
    },
    default: false,
    forced: false,
    duration: 5957,
    pathExtracted: '',
    size: 2421596228,
    tasks: []
  },
  {
    id: 3,
    name: 'FR FORCED',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 4,
      bitRate: 0
    },
    default: true,
    forced: false,
    duration: 2680,
    pathExtracted: '',
    size: 113,
    tasks: []
  },
  {
    id: 4,
    name: 'FULL FR',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 649,
      bitRate: 25
    },
    default: false,
    forced: false,
    duration: 5462,
    size: 17423
  }
] as Track[]
test('Nobody Has to Know', () => {
  const results = Brain.getInstance().analyse(
    nobodyHasToKnowTracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(12)
  const changes = changeListToMap(results.changes)
  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('en')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 5.1')
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)

  expect(changes['Audio 2']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 2']['Update_Name']?.newValue).toBe('5.1')

  expect(changes['Subtitles 3']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Subtitles 3']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Subtitles 3']['Update_Forced']?.currentValue).toBe(false)
  expect(changes['Subtitles 3']['Update_Forced']?.newValue).toBe(true)
  expect(changes['Subtitles 3']['Update_Name']?.currentValue).toBe('FR FORCED')
  expect(changes['Subtitles 3']['Update_Name']?.newValue).toBe('Forced')
  expect(changes['Subtitles 3']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Subtitles 3']['Update_Default']?.newValue).toBe(false)

  expect(changes['Subtitles 4']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Subtitles 4']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Subtitles 4']['Update_Name']?.currentValue).toBe('FULL FR')
  expect(changes['Subtitles 4']['Update_Name']?.newValue).toBe('Full')
})

const mesMeilleursCopainsTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1036'
    },
    default: true,
    forced: false,
    duration: 6677,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    name: 'Stereo',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 6677
  }
] as Track[]
test('Mes meilleurs copains issue', () => {
  const results = Brain.getInstance().analyse(
    mesMeilleursCopainsTracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VFF',
        pattern: /(\s+VFF\s+|\s+TRUEFRENCH\s+)/i,
        ietf: 'fr-FR',
        alpha2: 'fr'
      },
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(5)
  const changes = changeListToMap(results.changes)
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)
  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('Stereo')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
})

const laSoifDeLorTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: true,
    forced: false,
    duration: 5067,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 5067,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 2,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    properties: {},
    default: true,
    forced: false,
    duration: 5056
  }
] as Track[]
test('La soif de l or issue', () => {
  const results = Brain.getInstance().analyse(
    laSoifDeLorTracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(7)
  const changes = changeListToMap(results.changes)
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)
  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Subtitles 2']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Subtitles 2']['Update_Default']?.newValue).toBe(false)
})

const leNouveauProtocoleTracks = [
  {
    id: 0,
    name: 'HDLight',
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x816',
      frames: 133585,
      bitRate: 2999780
    },
    default: true,
    forced: true,
    duration: 5571,
    pathExtracted: '',
    size: 2089200439,
    tasks: []
  },
  {
    id: 1,
    name: 'FR VOF : AC3 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'und',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 174111,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 5571,
    size: 312006912
  }
] as Track[]
test('Le nouveau protocole fake for coverage', () => {
  const results = Brain.getInstance().analyse(
    leNouveauProtocoleTracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(7)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')

  expect(changes['Video 0']['Update_Name']?.currentValue).toBe('HDLight')
  expect(changes['Video 0']['Update_Name']?.newValue).toBe('')
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)
  expect(changes['Video 0']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Forced']?.newValue).toBe(false)
  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('FR VOF : AC3 5.1')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 5.1')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
})

const lesHommesPreferentLesGrossesTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: false,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'und',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 4778
  }
] as Track[]
test('Les hommes preferent les grosses', () => {
  const results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesTracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(4)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')

  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
})

const lesHommesPreferentLesGrossesFake1Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: false,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'und',
    name: 'FRENCH 2.0',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 4778
  }
] as Track[]
test('Les hommes preferent les grosses fake for coverage 1', () => {
  const results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake1Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(4)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('FRENCH 2.0')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
})

const lesHommesPreferentLesGrossesFake2Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: false,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'und',
    name: 'Audio 2.0',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 4778
  }
] as Track[]
test('Les hommes preferent les grosses fake for coverage 2', () => {
  const results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake2Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(4)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('Audio 2.0')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
})

const lesHommesPreferentLesGrossesFake3Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: false,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'und',
    name: 'Audio 2.0',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 2,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    name: 'not clear',
    properties: {},
    default: false,
    forced: true,
    duration: 4778,
    pathExtracted: ''
  },
  {
    id: 3,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    name: 'commentaires realisateur',
    properties: {},
    default: false,
    forced: true,
    duration: 4778
  }
] as Track[]
test('Les hommes preferent les grosses fake for coverage 3', () => {
  let results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake3Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(8)
  expect(results.hints.length).toBe(4)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')
  expect(hints['Language 2']).toBe('fr-FR')
  expect(hints['Subtitles Type 2']).toBe(SubtitlesType.FORCED)
  expect(hints['Language 3']).toBe('fr-FR')

  const userHints = results.hints
  userHints.find((h) => h.trackId === 2 && h.type === HintType.SUBTITLES_TYPE).value = SubtitlesType.SDH

  results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake3Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    userHints
  )

  const changes = changeListToMap(results.changes)

  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('Audio 2.0')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)

  expect(changes['Subtitles 2']['Update_Name']?.currentValue).toBe('not clear')
  expect(changes['Subtitles 2']['Update_Name']?.newValue).toBe('Full SDH')
  expect(changes['Subtitles 2']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Subtitles 2']['Update_Forced']?.newValue).toBe(false)
  expect(changes['Subtitles 3']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Subtitles 3']['Update_Forced']?.newValue).toBe(false)
})

const lesHommesPreferentLesGrossesFake4Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080'
    },
    default: false,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'und',
    name: 'Audio 2.0',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000
    },
    default: true,
    forced: false,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 2,
    type: 'Subtitles',
    codec: 'VobSub',
    name: 'Full Français',
    properties: {},
    default: false,
    forced: true,
    duration: 4778,
    pathExtracted: '',
    tasks: []
  },
  {
    id: 3,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'es',
    name: 'Français',
    properties: {},
    default: false,
    forced: true,
    duration: 4778
  }
] as Track[]
test('Les hommes preferent les grosses fake for coverage 4', () => {
  let results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake4Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [
      {
        key: 'VF',
        pattern: /(\s+VF\s+|FRENCH)/i,
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length).toBeGreaterThanOrEqual(10)
  expect(results.hints.length).toBe(3)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')
  expect(hints['Language 2']).toBe('fr-FR')
  expect(hints['Language 3']).toBe('fr-FR')

  const userHints = results.hints
  userHints.find((h) => h.trackId === 2).value = 'en-US'

  results = Brain.getInstance().analyse(
    lesHommesPreferentLesGrossesFake4Tracks,
    getFakeAbsolutePath('Download', 'hommes-grosses.mkv'),
    'Les hommes preferent les grosses',
    defaultPoster1,
    'Les hommes preferent les grosses By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [{ key: 'VF', pattern: /(\s+VF\s+|FRENCH)/i, alpha2: 'fr' }],
    userHints
  )

  const changes = changeListToMap(results.changes)

  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')

  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('und')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('Audio 2.0')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 2.0')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)

  expect(changes['Subtitles 2']['Update_Language']?.currentValue).toBe(undefined)
  expect(changes['Subtitles 2']['Update_Language']?.newValue).toBe('en-US')
  expect(changes['Subtitles 2']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Subtitles 2']['Update_Forced']?.newValue).toBe(false)
  expect(changes['Subtitles 2']['Update_Name']?.currentValue).toBe('Full Français')
  expect(changes['Subtitles 2']['Update_Name']?.newValue).toBe('Full')
  expect(changes['Subtitles 3']['Update_Language']?.currentValue).toBe('es')
  expect(changes['Subtitles 3']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Subtitles 3']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Subtitles 3']['Update_Forced']?.newValue).toBe(false)
  expect(changes['Subtitles 3']['Update_Name']?.currentValue).toBe('Français')
  expect(changes['Subtitles 3']['Update_Name']?.newValue).toBe('Full')
})

const nobodyHasToKnow2Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x804',
      frames: 142968,
      bitRate: 9942003
    },
    default: true,
    forced: false,
    duration: 5957,
    pathExtracted: '',
    size: 7403064381,
    tasks: []
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 558469,
      bitRate: 3184535
    },
    default: true,
    forced: false,
    duration: 5957,
    pathExtracted: '',
    size: 2371286096,
    tasks: []
  },
  {
    id: 2,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 558469,
      bitRate: 3252100
    },
    default: false,
    forced: true,
    duration: 5957,
    pathExtracted: '',
    size: 2421596228,
    tasks: []
  },
  {
    id: 3,
    name: 'FR FORCED',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 4,
      bitRate: 0
    },
    default: true,
    forced: false,
    duration: 2680,
    pathExtracted: '',
    size: 113,
    tasks: []
  },
  {
    id: 4,
    name: 'FULL Français',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    properties: {
      textSubtitles: true,
      frames: 649,
      bitRate: 25
    },
    default: false,
    forced: false,
    duration: 5462,
    size: 17423
  }
] as Track[]
test('Nobody Has to Know 2 faked', () => {
  let results = Brain.getInstance().analyse(
    nobodyHasToKnow2Tracks,
    getFakeAbsolutePath('Download', 'nobody-has-to-know.mkv'),
    'Nobody Has to Know',
    defaultPoster1,
    'Nobody Has to Know By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('en-GB'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(12)
  expect(results.hints.length).toBe(3)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr')
  expect(hints['Language 2']).toBe('en-GB')
  expect(hints['Language 4']).toBe('fr')

  const userHints = results.hints
  userHints.forEach((h) => (h.trackId !== 2 ? (h.value = 'fr-FR') : undefined))

  results = Brain.getInstance().analyse(
    nobodyHasToKnow2Tracks,
    getFakeAbsolutePath('Download', 'nobody-has-to-know.mkv'),
    'Nobody Has to Know',
    defaultPoster1,
    'Nobody Has to Know By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('en-GB'),
    [],
    [],
    userHints
  )
  const changes = changeListToMap(results.changes)

  expect(changes['Video 0']['Update_Language']?.currentValue).toBe('en')
  expect(changes['Video 0']['Update_Language']?.newValue).toBe('en-GB')
  expect(changes['Video 0']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Video 0']['Update_Default']?.newValue).toBe(false)

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VFF 5.1')
  expect(changes['Audio 1']['Update_Language']?.currentValue).toBe('fr')
  expect(changes['Audio 1']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)

  expect(changes['Audio 2']['Update_Name']?.currentValue).toBe(undefined)
  expect(changes['Audio 2']['Update_Name']?.newValue).toBe('VO 5.1')
  expect(changes['Audio 2']['Update_Language']?.currentValue).toBe('en')
  expect(changes['Audio 2']['Update_Language']?.newValue).toBe('en-GB')
  expect(changes['Audio 2']['Update_Forced']?.currentValue).toBe(true)
  expect(changes['Audio 2']['Update_Forced']?.newValue).toBe(false)

  expect(changes['Subtitles 4']['Update_Language']?.currentValue).toBe(undefined)
  expect(changes['Subtitles 4']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Subtitles 4']['Update_Name']?.currentValue).toBe('FULL Français')
  expect(changes['Subtitles 4']['Update_Name']?.newValue).toBe('Full')
})

const nobodyHasToKnow3Tracks = [
  {
    id: 1,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'fr',
    name: 'FR Audio 5.1',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 558469,
      bitRate: 3184535
    },
    default: true,
    forced: false,
    duration: 5957,
    size: 2371286096
  }
] as Track[]
test('Nobody Has to Know 3 faked', () => {
  let results = Brain.getInstance().analyse(
    nobodyHasToKnow3Tracks,
    getFakeAbsolutePath('Download', 'nobody-has-to-know.mkv'),
    'Nobody Has to Know',
    defaultPoster1,
    'Nobody Has to Know By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(3)
  expect(results.hints.length).toBe(1)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')

  results = Brain.getInstance().analyse(
    nobodyHasToKnow3Tracks,
    getFakeAbsolutePath('Download', 'nobody-has-to-know.mkv'),
    'Nobody Has to Know',
    defaultPoster1,
    'Nobody Has to Know By Team XYZ',
    undefined,
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [],
    results.hints
  )
  const changes = changeListToMap(results.changes)

  expect(changes['Audio 1']['Update_Name']?.currentValue).toBe('FR Audio 5.1')
  expect(changes['Audio 1']['Update_Name']?.newValue).toBe('VO 5.1')
  expect(changes['Audio 1']['Update_Default']?.currentValue).toBe(true)
  expect(changes['Audio 1']['Update_Default']?.newValue).toBe(false)
})

const savateBadAttachmentsTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '468x360',
      frames: 132007,
      bitRate: 285893
    },
    default: true,
    forced: false,
    duration: 5280,
    pathExtracted: '',
    size: 188699816,
    tasks: []
  },
  {
    id: 1,
    name: 'VF 2.0',
    type: 'Audio',
    codec: 'AAC',
    language: 'fr',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 44100,
      frames: 227405,
      bitRate: 127999
    },
    default: true,
    forced: false,
    duration: 5280,
    size: 84485340
  }
] as Track[]
const savateBadAttachmentsAttachments: Attachment[] = [
  {
    filename: 'cover.jpg',
    mimeType: 'image/jpeg',
    description: ''
  }
]
test('Savate Bad Attachments Tests', () => {
  const results = Brain.getInstance().analyse(
    savateBadAttachmentsTracks,
    getFakeAbsolutePath('Download', 'savate.mkv'),
    'Savate',
    defaultPoster1,
    'Savate By Team XYZ',
    savateBadAttachmentsAttachments,
    2,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(8)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)

  expect(changes['Container']['Delete_Tags']?.property).toBe(ChangeProperty.TAGS)

  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).filename).toBe('cover.jpg')
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).mimeType).toBe('image/jpeg')
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).description).toContain('TMDB Poster')
  expect(!!(changes['Container']['Update_Poster Image']?.newValue as Attachment).path, 'Poster path defined ?').toBe(
    true
  )
})

const savateBadAttachmentsAttachments2: Attachment[] = [
  {
    filename: 'cover.jpg',
    mimeType: 'image/jpeg',
    description: ''
  },
  {
    filename: 'zob.png',
    mimeType: 'image/png',
    description: 'not to keep'
  }
]
test('Savate Bad Attachments Tests clear', () => {
  const results = Brain.getInstance().analyse(
    savateBadAttachmentsTracks,
    getFakeAbsolutePath('Download', 'savate.mkv'),
    'Savate',
    defaultPoster1,
    'Savate By Team XYZ',
    savateBadAttachmentsAttachments2,
    5,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(8)
  expect(results.hints.length).toBe(1)
  const changes = changeListToMap(results.changes)

  expect(changes['Container']['Delete_Tags']?.property).toBe(ChangeProperty.TAGS)

  expect(changes['Container']['Delete_Attachments']?.property).toBe(ChangeProperty.ATTACHMENTS)
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).filename).toBe('cover.jpg')
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).mimeType).toBe('image/jpeg')
})

test('Capitaine Marleau undefined and qad cases', () => {
  const tracks = [
    {
      id: 0,
      type: 'Video',
      codec: 'AVC/H.264/MPEG-4p10',
      language: 'und',
      properties: {
        videoDimensions: '1920x1080',
        frames: 134474,
        bitRate: 4987571
      },
      default: true,
      forced: false,
      duration: 5378,
      pathExtracted: '',
      size: 3353493266,
      tasks: []
    },
    {
      id: 1,
      name: 'FRENCH',
      type: 'Audio',
      codec: 'AAC',
      language: 'fr',
      properties: {
        audioChannels: 2,
        audioSamplingFrequency: 48000,
        frames: 252142,
        bitRate: 96000
      },
      default: true,
      forced: false,
      duration: 5379,
      pathExtracted: '',
      size: 64548352,
      tasks: []
    },
    {
      id: 2,
      name: 'FRENCH AD',
      type: 'Audio',
      codec: 'AAC',
      language: 'qad',
      properties: {
        audioChannels: 2,
        audioSamplingFrequency: 48000,
        frames: 252141,
        bitRate: 191999
      },
      default: false,
      forced: false,
      duration: 5379,
      pathExtracted: '',
      size: 129096097,
      tasks: []
    },
    {
      id: 3,
      name: 'FRENCH SDH',
      type: 'Subtitles',
      codec: 'SubRip/SRT',
      language: 'fr',
      properties: {
        textSubtitles: true,
        frames: 1285,
        bitRate: 68
      },
      default: false,
      forced: false,
      duration: 5325,
      size: 45622
    }
  ] as Track[]

  const results = Brain.getInstance().analyse(
    tracks,
    getFakeAbsolutePath('Download', 'captain-marleau.mkv'),
    'Captain Marleau',
    defaultPoster1,
    'Captain Marleau By Team XYZ',
    [],
    0,
    Languages.getLanguageByCode('fr-FR'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(8)
  const changes = changeListToMap(results.changes)

  expect(changes['Video 0']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 2']['Update_Language']?.newValue).toBe('fr-FR')
  expect(changes['Audio 2']['Update_Name']?.newValue).toBe('AD 2.0')
})

const nefariousTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'MPEG-1/2',
    language: 'en',
    properties: {
      videoDimensions: '720x576',
      frames: 140951,
      bitRate: 7918330
    },
    default: false,
    forced: false,
    duration: 5638.04,
    size: 5580482954
  },
  {
    id: 1,
    name: 'Surround 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 176187,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 5637.984,
    size: 315727104
  },
  {
    id: 2,
    name: 'Stéréo',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 176188,
      bitRate: 192000
    },
    default: false,
    forced: false,
    duration: 5638.016,
    size: 135312384
  },
  {
    id: 3,
    name: 'Surround 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 176187,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 5637.984,
    size: 315727104
  },
  {
    id: 4,
    name: 'Stéréo',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 176188,
      bitRate: 192000
    },
    default: false,
    forced: false,
    duration: 5638.016,
    size: 135312384
  },
  {
    id: 5,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    properties: {
      frames: 1,
      bitRate: 802
    },
    default: true,
    forced: false,
    duration: 11.798755555,
    size: 1184
  },
  {
    id: 6,
    type: 'Subtitles',
    codec: 'VobSub',
    language: 'fr',
    properties: {
      frames: 1525,
      bitRate: 7888
    },
    default: false,
    forced: false,
    duration: 5467.229866666,
    size: 5390858
  }
] as Track[]
test('Nefarious brain', () => {
  const results = Brain.getInstance().analyse(
    nefariousTracks,
    getFakeAbsolutePath('Ripped', 'nefarious (2023).mkv'),
    'Nefarious',
    defaultPoster1,
    'Nefarious XYZ',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(8)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr')
  expect(hints['Language 2']).toBe('fr')
  expect(hints['Language 3']).toBe('en-US')
  expect(hints['Language 4']).toBe('en-US')
  expect(hints['Subtitles Type 5']).toBe('Forced')
  expect(hints['Subtitles Type 6']).toBe('Full')

  expect(results.hints.length).toBe(6)

  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).filename).toBe('cover.jpg')
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).mimeType).toBe('image/jpeg')
  expect(changes['Container']['Update_Poster Image']?.currentValue as Attachment).toBeUndefined()
  expect((changes['Container']['Update_Poster Image']?.newValue as Attachment).description).toContain('TMDB Poster')
  expect(!!(changes['Container']['Update_Poster Image']?.newValue as Attachment).path, 'Poster path defined ?').toBe(
    true
  )
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
] as Track[]
test('Guadalupe Already Processed Brain', () => {
  const results = Brain.getInstance().analyse(
    guadalupeTracks,
    getFakeAbsolutePath('Ripped', 'Guadalupe։ Mother of Humanity (2024).mkv'),
    'Guadalupe: Mother of Humanity (2024)',
    {
      filename: 'cover.jpg',
      mimeType: 'image/jpeg',
      description: 'TMDB Poster https://image.tmdb.org/t/p/w1280/pv93PwJn0NoIvsK6MTO45dVtyq2.jpg'
    },
    'Guadalupe: Mother of Humanity (2024)',
    [
      {
        filename: 'cover.jpg',
        mimeType: 'image/jpeg',
        description: 'TMDB Poster https://image.tmdb.org/t/p/w1280/pv93PwJn0NoIvsK6MTO45dVtyq2.jpg'
      }
    ] as Attachment[],
    0,
    Languages.getLanguageByCode('es-ES'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Only Poster Change Expected').toBe(1)
  expect(results.hints.length, '2 Hints Expected').toBe(0)
})

const ashTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1248x520',
      frames: 138879,
      bitRate: 3116427
    },
    default: true,
    forced: false,
    duration: 5786.625,
    size: 2254199330
  },
  {
    id: 1,
    name: 'French (France)',
    type: 'Audio',
    codec: 'E-AC-3',
    language: 'fr-FR',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 180833,
      bitRate: 640000
    },
    default: true,
    forced: false,
    duration: 5786.656,
    size: 462932480
  },
  {
    id: 2,
    name: 'French (Canadien)',
    type: 'Audio',
    codec: 'E-AC-3',
    language: 'fr-CA',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 180833,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 5786.656,
    size: 462932480
  },
  {
    id: 3,
    name: 'French (France) Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 31,
      bitRate: 1
    },
    default: true,
    forced: true,
    duration: 4690.791,
    size: 970
  },
  {
    id: 4,
    name: 'French (France)',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 627,
      bitRate: 24
    },
    default: false,
    forced: false,
    duration: 5665.708,
    size: 17574
  },
  {
    id: 5,
    name: 'French (Canadien) Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-CA',
    properties: {
      textSubtitles: true,
      frames: 27,
      bitRate: 1
    },
    default: false,
    forced: true,
    duration: 3777.958,
    size: 823
  },
  {
    id: 6,
    name: 'French (Canadien)',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-CA',
    properties: {
      textSubtitles: true,
      frames: 629,
      bitRate: 26
    },
    default: false,
    forced: false,
    duration: 5665.708,
    size: 19012
  },
  {
    id: 7,
    name: 'SDH',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en-US',
    properties: {
      textSubtitles: true,
      frames: 1097,
      bitRate: 43
    },
    default: false,
    forced: false,
    duration: 5686.125,
    size: 30613
  }
] as Track[]

test('Ash brain', () => {
  const results = Brain.getInstance().analyse(
    ashTracks,
    getFakeAbsolutePath('Download', 'Ash.2025.FRENCH.720p.WEB.H264-SUPPLY.mkv'),
    'Ash (2025)',
    defaultPoster1,
    'Ash (2025) XYZ',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(8)
  const changes = changeListToMap(results.changes)

  expect(changes['Audio 1']['Update_Language']).toBeUndefined()
  expect(changes['Audio 2']['Update_Language']).toBeUndefined()
  expect(changes['Subtitles 3']['Update_Language']).toBeUndefined()
  expect(changes['Subtitles 4']['Update_Language']).toBeUndefined()
  expect(changes['Subtitles 5']['Update_Language']).toBeUndefined()
  expect(changes['Subtitles 6']['Update_Language']).toBeUndefined()

  expect(results.hints.length).toBe(0)
})

const cowboyPacifisteTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1280x720',
      frames: 78087,
      bitRate: 2167779
    },
    default: true,
    forced: false,
    duration: 3123.48,
    size: 846376989
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'fr',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 146415,
      bitRate: 125371
    },
    default: true,
    forced: false,
    duration: 3123.52,
    size: 48950223
  }
] as Track[]

test('Cowboy Pacifiste', () => {
  const results = Brain.getInstance().analyse(
    cowboyPacifisteTracks,
    getFakeAbsolutePath('Download', 'Terence.Hill.un.cowboy.pacifiste.2025.DOC.VFF.HDTV.720p.H264.AAC-NoX.mkv'),
    'Terence Hill, un cowboy pacifiste (2025)',
    defaultPoster1,
    'Terence Hill, un cowboy pacifiste (2025) XYZ',
    [],
    0,
    Languages.getLanguageByCode('de-DE'),
    [],
    [
      {
        key: 'VFF',
        pattern: /(\bVFF\b|\bTRUEFRENCH\b)/i,
        ietf: 'fr-FR',
        alpha2: 'fr'
      }
    ],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(7)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(changes['Audio 1']['Update_Language'].newValue).toBe('fr-FR')
  expect(changes['Audio 1']['Update_Name'].newValue).toBe('VFF 2.0')
  expect(changes['Audio 1']['Update_Default'].newValue).toBe(false)

  expect(results.hints.length).toBe(1)
  expect(hints['Language 1']).toBe('fr-FR')
})

const savingPrivateRyanTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x1080',
      frames: 243805,
      bitRate: 27486722
    },
    default: true,
    forced: false,
    duration: 10168.701,
    size: 34938032653,
    copy: true
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'DTS-HD Master Audio',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 953317,
      bitRate: 4197823
    },
    default: false,
    forced: false,
    duration: 10168.715,
    size: 5335809016,
    copy: true
  },
  {
    id: 2,
    type: 'Audio',
    codec: 'DTS',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 953317,
      bitRate: 1508999
    },
    default: false,
    forced: false,
    duration: 10168.715,
    size: 1918073804,
    copy: true
  },
  {
    id: 3,
    type: 'Audio',
    codec: 'AC-3',
    language: 'de',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 317773,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 10168.736,
    size: 813498880,
    copy: true
  },
  {
    id: 4,
    type: 'Audio',
    codec: 'AC-3',
    language: 'es-ES',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 317773,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 10168.736,
    size: 813498880,
    copy: true
  },
  {
    id: 5,
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr-FR',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 317773,
      bitRate: 640000
    },
    default: true,
    forced: false,
    duration: 10168.736,
    size: 813498880,
    copy: true
  },
  {
    id: 6,
    type: 'Audio',
    codec: 'AC-3',
    language: 'it',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 317773,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 10168.736,
    size: 813498880,
    copy: true
  },
  {
    id: 7,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'da',
    properties: {
      frames: 3374,
      bitRate: 27422
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 34772102,
    copy: true
  },
  {
    id: 8,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'de',
    properties: {
      frames: 3378,
      bitRate: 32240
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 40881935,
    copy: true
  },
  {
    id: 9,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'en',
    properties: {
      frames: 3358,
      bitRate: 31808
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 40333662,
    copy: true
  },
  {
    id: 10,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'es-ES',
    properties: {
      frames: 3380,
      bitRate: 29831
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 37827802,
    copy: true
  },
  {
    id: 11,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fr-FR',
    properties: {
      frames: 2948,
      bitRate: 27226
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 34524537,
    copy: true
  },
  {
    id: 12,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'it',
    properties: {
      frames: 3192,
      bitRate: 27120
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 34389758,
    copy: true
  },
  {
    id: 13,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'nl',
    properties: {
      frames: 3378,
      bitRate: 27709
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 35136071,
    copy: true
  },
  {
    id: 14,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'no',
    properties: {
      frames: 3374,
      bitRate: 27048
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 34298179,
    copy: true
  },
  {
    id: 15,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fi',
    properties: {
      frames: 3378,
      bitRate: 29382
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 37258514,
    copy: true
  },
  {
    id: 16,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'sv',
    properties: {
      frames: 3374,
      bitRate: 26500
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 33603654,
    copy: true
  },
  {
    id: 17,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'en',
    properties: {
      frames: 3600,
      bitRate: 34138
    },
    default: false,
    forced: false,
    duration: 10144.238,
    size: 43288519,
    copy: true
  },
  {
    id: 18,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'de',
    properties: {
      frames: 32,
      bitRate: 197
    },
    default: false,
    forced: true,
    duration: 10144.238,
    size: 251044,
    copy: true
  },
  {
    id: 19,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'es-ES',
    properties: {
      frames: 12,
      bitRate: 82
    },
    default: false,
    forced: true,
    duration: 10144.238,
    size: 104890,
    copy: true
  },
  {
    id: 20,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fr-FR',
    properties: {
      frames: 10,
      bitRate: 48
    },
    default: true,
    forced: true,
    duration: 10144.238,
    size: 61681,
    copy: true
  },
  {
    id: 21,
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'it',
    properties: {
      frames: 10,
      bitRate: 60
    },
    default: false,
    forced: true,
    duration: 10144.238,
    size: 76560,
    copy: true
  }
] as Track[]
test('Saving Private Ryan', () => {
  const results = Brain.getInstance().analyse(
    savingPrivateRyanTracks,
    getFakeAbsolutePath(
      'Download',
      'Il faut sauver le soldat Ryan 1998 MULTi VFF 1080p Blu-ray Remux AVC DTS-HD MA 5.1-QBDom.mkv'
    ),
    'Il faut sauver le soldat Ryan (1998)',
    defaultPoster1,
    'Il faut sauver le soldat Ryan (1998) XYZ',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(7)
  const changes = changeListToMap(results.changes)
  const hints = hintListToMap(results.hints)

  expect(changes['Audio 1']['Update_Language'].newValue).toBe('en-US')
  expect(changes['Subtitles 9']['Update_Name'].newValue).toBe('Full')
  expect(changes['Subtitles 11']['Update_Name'].newValue).toBe('Full')
  expect(changes['Subtitles 17']['Update_Name'].newValue).toBe('Full SDH')
  expect(changes['Subtitles 18']['Update_Name'].newValue).toBe('Forced')
  expect(changes['Subtitles 19']['Update_Name'].newValue).toBe('Forced')
  expect(changes['Subtitles 20']['Update_Name'].newValue).toBe('Forced')

  expect(results.hints.length).toBe(21)
  expect(hints['Language 1']).toBe('en-US')
})

test('Saving Private Ryan Delete Tracks', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR', 'es']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    savingPrivateRyanTracks,
    getFakeAbsolutePath(
      'Download',
      'Il faut sauver le soldat Ryan 1998 MULTi VFF 1080p Blu-ray Remux AVC DTS-HD MA 5.1-QBDom.mkv'
    ),
    'Il faut sauver le soldat Ryan (1998)',
    defaultPoster1,
    'Il faut sauver le soldat Ryan (1998) XYZ',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [],
    [],
    []
  )
  expect(results.changes.length, 'Number of changes').toBeGreaterThanOrEqual(7)
  const changes = changeListToMap(results.changes)

  expect(changes['Audio 1']['Delete']).toBeUndefined()
  expect(changes['Audio 2']['Delete']).toBeUndefined()
  expect(changes['Audio 3']['Delete']).toBeDefined()
  expect(changes['Audio 4']['Delete']).toBeUndefined()
  expect(changes['Audio 5']['Delete']).toBeUndefined()
  expect(changes['Audio 6']['Delete']).toBeDefined()
  expect(changes['Subtitles 7']['Delete']).toBeDefined()
  expect(changes['Subtitles 8']['Delete']).toBeDefined()
  expect(changes['Subtitles 9']['Delete']).toBeUndefined()
  expect(changes['Subtitles 10']['Delete']).toBeUndefined()
  expect(changes['Subtitles 11']['Delete']).toBeUndefined()
  expect(changes['Subtitles 12']['Delete']).toBeDefined()
  expect(changes['Subtitles 13']['Delete']).toBeDefined()
  expect(changes['Subtitles 14']['Delete']).toBeDefined()
  expect(changes['Subtitles 15']['Delete']).toBeDefined()
  expect(changes['Subtitles 16']['Delete']).toBeDefined()
  expect(changes['Subtitles 17']['Delete']).toBeUndefined()
  expect(changes['Subtitles 18']['Delete']).toBeDefined()
  expect(changes['Subtitles 19']['Delete']).toBeUndefined()
  expect(changes['Subtitles 20']['Delete']).toBeUndefined()
  expect(changes['Subtitles 21']['Delete']).toBeDefined()
})

const holdOutTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '854x480',
      frames: 208022,
      bitRate: 677953
    },
    default: true,
    forced: false,
    duration: 8667.583,
    size: 734526886,
    copy: true
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'en',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 406295,
      bitRate: 128000
    },
    default: true,
    forced: false,
    duration: 8667.626,
    size: 138682027,
    copy: false
  }
] as Track[]
test('Hold Out', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    holdOutTracks,
    getFakeAbsolutePath('Download', 'Hold Out (2022).mp4'),
    'Hold Out (2022)',
    defaultPoster1,
    'Hold Out (2022)',
    [],
    0,
    Languages.getLanguageByCode('fr-FR'),
    [Countries.getCountryByCode('FR')],
    [],
    []
  )
  // expect(results.changes.length, "Number of changes").toBeGreaterThanOrEqual(6);
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 1']['Delete']).toBeUndefined()
})

const chickenHareTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x804',
      frames: 74250,
      bitRate: 2577070
    },
    default: false,
    forced: false,
    duration: 3096.844,
    size: 997598254,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'VF 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 96778,
      bitRate: 384000
    },
    default: false,
    forced: false,
    duration: 3096.896,
    size: 148651008,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 1,
      bitRate: 53
    },
    default: false,
    forced: true,
    duration: 5.338,
    size: 36,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'Full',
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fr',
    properties: {
      frames: 1092,
      bitRate: 48502
    },
    default: false,
    forced: false,
    duration: 2959.498,
    size: 17942777,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Chickenhare guess of french language', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    chickenHareTracks,
    getFakeAbsolutePath('Download', 'Chickenhare and the Hamster of Darkness (2022).mkv'),
    'Hopper et le hamster des ténèbres (2022)',
    defaultPoster1,
    'Chickenhare and the Hamster of Darkness (2022)',
    [],
    0,
    Languages.getLanguageByCode('en'),
    [Countries.getCountryByCode('BE'), Countries.getCountryByCode('FR')],
    [],
    []
  )
  // expect(results.changes.length, "Number of changes").toBeGreaterThanOrEqual(6);
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr-FR')
})

const tenxtenTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x720',
      frames: 125069,
      bitRate: 3000351
    },
    default: true,
    forced: false,
    duration: 5216.42,
    size: 1956386666,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'Surround',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 163007,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 5216.224,
    size: 292108544,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'Surround',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 163007,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 5216.224,
    size: 292108544,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 4,
      bitRate: 0
    },
    default: true,
    forced: true,
    duration: 1795.293,
    size: 66,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 645,
      bitRate: 33
    },
    default: false,
    forced: false,
    duration: 5123.577,
    size: 21317,
    copy: true,
    unsupported: false
  }
] as Track[]
test('10x10 wrong VO for french language', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    tenxtenTracks,
    getFakeAbsolutePath('Download', 'bugs', '10x10 (2018).mkv'),
    'Outfall (2018)',
    defaultPoster1,
    'Outfall (2018)',
    [],
    0,
    Languages.getLanguageByCode('en'),
    [Countries.getCountryByCode('GB'), Countries.getCountryByCode('US')],
    [],
    []
  )
  // expect(results.changes.length, "Number of changes").toBeGreaterThanOrEqual(6);
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 1']['Update_Name'].newValue).toBe('VFI 5.1')
  expect(changes['Audio 2']['Update_Name'].newValue).toBe('VO 5.1')
  const hints = hintListToMap(results.hints)

  expect(hints['Language 1']).toBe('fr')
})

const twelveRoundsTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1280x536',
      frames: 157745,
      bitRate: 3043872
    },
    default: true,
    forced: false,
    duration: 6579.281,
    size: 2503311920,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'VFF AAC 5.1 VBR',
    type: 'Audio',
    codec: 'AAC',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 308406,
      bitRate: 231433
    },
    default: true,
    forced: false,
    duration: 6579.328,
    size: 190334744,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'VO AAC 5.1 VBR',
    type: 'Audio',
    codec: 'AAC',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 308406,
      bitRate: 232955
    },
    default: false,
    forced: false,
    duration: 6579.328,
    size: 191585982,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: '[Francais (Complet)]',
    type: 'Subtitles',
    codec: 'SubStationAlpha',
    properties: {
      textSubtitles: true,
      frames: 1176,
      bitRate: 101
    },
    default: false,
    forced: false,
    duration: 6530.36,
    size: 83256,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Twelve rounds no language on sub track bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    twelveRoundsTracks,
    getFakeAbsolutePath('Download', 'bugs', '12 Rounds (2009).mkv'),
    '12 Rounds (2009)',
    defaultPoster1,
    '12 Rounds (2009)',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const hints = hintListToMap(results.hints)
  expect(hints['Language 3']).toBe('fr')
  const changes = changeListToMap(results.changes)
  expect(changes['Subtitles 3']['Update_Name'].newValue).toBe('Full')
})

const salvableTracks = [
  {
    id: 0,
    name: 'WEBRip LiHDL (Source WEB SUPPLY)',
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'und',
    properties: {
      videoDimensions: '1920x800',
      frames: 144991,
      bitRate: 2999668
    },
    default: true,
    forced: false,
    duration: 6047.333,
    size: 2267499592,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'FR VFi : AC3 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 188980,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 6047.36,
    size: 338652160,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'ENG VO : AC3 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 188980,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 6047.36,
    size: 338652160,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'FR Forced : SRT',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 6,
      bitRate: 0
    },
    default: true,
    forced: true,
    duration: 4452.407,
    size: 274,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    name: 'FR Full : SRT',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 1283,
      bitRate: 51
    },
    default: false,
    forced: false,
    duration: 5731.809,
    size: 36793,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    name: 'ENG SDH : SRT',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en-US',
    properties: {
      textSubtitles: true,
      frames: 1502,
      bitRate: 55
    },
    default: false,
    forced: false,
    duration: 6040.202,
    size: 41569,
    copy: false,
    unsupported: false
  }
] as Track[]
test('Savable sub track removal bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    salvableTracks,
    getFakeAbsolutePath('Download', 'bugs', 'Salvable.2025.MULTi.VFi.1080p.WEBRip.AC3.5.1.H264-LiHDL.mkv'),
    'Salvable (2025)',
    defaultPoster1,
    'Salvable (2025)',
    [],
    0,
    Languages.getLanguageByCode('en-GB'),
    [Countries.getCountryByCode('GB')],
    [],
    []
  )
  //const hints = hintListToMap(results.hints);
  //expect(hints["Language 3"]).toBe("fr");
  const changes = changeListToMap(results.changes)
  expect(changes['Subtitles 5']['Delete']).toBeUndefined()
})

const workingManTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x800',
      frames: 170286,
      bitRate: 3000416
    },
    default: false,
    forced: false,
    duration: 7095.25,
    size: 2661088368,
    copy: true,
    unsupported: false
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
      frames: 221727,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 7095.264,
    size: 397334784,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'VO 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en-US',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 221727,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 7095.264,
    size: 397334784,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 24,
      bitRate: 1
    },
    default: false,
    forced: true,
    duration: 5297.5,
    size: 697,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    name: 'Full',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr-FR',
    properties: {
      textSubtitles: true,
      frames: 1091,
      bitRate: 32
    },
    default: false,
    forced: false,
    duration: 6733.625,
    size: 27628,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    name: 'Full SDH',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en-US',
    properties: {
      textSubtitles: true,
      frames: 1705,
      bitRate: 50
    },
    default: false,
    forced: false,
    duration: 6899.042,
    size: 43226,
    copy: true,
    unsupported: false
  }
] as Track[]
test('A Working Man language selection bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    workingManTracks,
    'C:\\Download\\A Working Man (2025).mkv',
    'A Working Man (2025)',
    defaultPoster1,
    'A Working Man (2025)',
    [],
    0,
    Languages.getLanguageByCode('en'),
    [Countries.getCountryByCode('GB'), Countries.getCountryByCode('US')],
    [],
    []
  )
  //const hints = hintListToMap(results.hints);
  //expect(hints["Language 3"]).toBe("fr");
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 2']['Update_Language'].newValue).toBe('en')
  expect(changes['Subtitles 5']['Update_Language'].newValue).toBe('en')
  expect(changes['Subtitles 5']['Delete']).toBeUndefined()
})

const captainAmericaTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'HEVC/H.265/MPEG-H',
    properties: {
      videoDimensions: '1920x808',
      frames: 212474,
      bitRate: 1219028
    },
    default: true,
    forced: false,
    duration: 8861.958,
    size: 1350372487,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AAC',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 24000,
      frames: 207701,
      bitRate: 204714
    },
    default: true,
    forced: false,
    duration: 8861.91,
    size: 226770560,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    type: 'Audio',
    codec: 'AAC',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 24000,
      frames: 207700,
      bitRate: 204687
    },
    default: false,
    forced: false,
    duration: 8861.867,
    size: 226738910,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 61,
      bitRate: 1
    },
    default: true,
    forced: true,
    duration: 6288.39,
    size: 1113,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 1614,
      bitRate: 46
    },
    default: false,
    forced: false,
    duration: 8779.102,
    size: 50749,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en',
    properties: {
      textSubtitles: true,
      frames: 1865,
      bitRate: 50
    },
    default: false,
    forced: false,
    duration: 8759.71,
    size: 55539,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Captain America Civil War SDH bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    captainAmericaTracks,
    getFakeAbsolutePath('Download', 'bugs', 'Captain America - Civil War (2016).mkv'),
    'Captain America : Civil War (2016)',
    defaultPoster1,
    'Captain America : Civil War (2016)',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const hints = hintListToMap(results.hints)
  expect(hints['Subtitles Type 4']).toBe(SubtitlesType.FULL)
})

const passionOfChristTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    properties: {
      videoDimensions: '1920x1080',
      frames: 182007,
      bitRate: 2548087
    },
    default: true,
    forced: false,
    duration: 7591.209,
    size: 2417883051,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'Araméen AC3-5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'arc',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 237225,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 7591.2,
    size: 425107200,
    copy: false,
    unsupported: false
  },
  {
    id: 2,
    name: 'complets',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 524,
      bitRate: 36
    },
    default: true,
    forced: false,
    duration: 6831.312,
    size: 31194,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'complets',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en',
    properties: {
      textSubtitles: true,
      frames: 519,
      bitRate: 34
    },
    default: false,
    forced: false,
    duration: 6709.03,
    size: 29210,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Passion Of Christ wrongly delete aramaic track bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    passionOfChristTracks,
    'C:\\Download\\bugs\\The Passion of the Christ (2004).mkv',
    'La Passion du Christ (2004)',
    defaultPoster1,
    'La Passion du Christ (2004)',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 1']['Delete']).toBeUndefined()
})

const willHuntingTracks = [
  {
    id: 0,
    name: '[zza] Will Hunting (1997)',
    type: 'Video',
    codec: 'HEVC/H.265/MPEG-H',
    properties: {
      videoDimensions: '1920x1040',
      frames: 182059,
      bitRate: 2387540
    },
    default: true,
    forced: true,
    duration: 7593.378,
    size: 2266187565,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'French',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 237316,
      bitRate: 384000
    },
    default: true,
    forced: true,
    duration: 7594.112,
    size: 364517376,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'English',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 237294,
      bitRate: 383997
    },
    default: false,
    forced: false,
    duration: 7593.45,
    size: 364483584,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'French forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 1,
      bitRate: 17
    },
    default: true,
    forced: true,
    duration: 5.4,
    size: 12,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    name: 'French complet',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 1844,
      bitRate: 64
    },
    default: false,
    forced: false,
    duration: 7270.742,
    size: 59009,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    name: 'French complet pour sourds et malentendants',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 2289,
      bitRate: 106
    },
    default: false,
    forced: false,
    duration: 7407.941,
    size: 98407,
    copy: false,
    unsupported: false
  },
  {
    id: 6,
    name: 'English complet',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en',
    properties: {
      textSubtitles: true,
      frames: 1693,
      bitRate: 87
    },
    default: false,
    forced: false,
    duration: 7096.651,
    size: 77895,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Will Hunting SDH deleted bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    willHuntingTracks,
    'C:\\Download\\bugs\\Good Will Hunting (1997).mkv',
    'Will Hunting (1997)',
    defaultPoster1,
    'Will Hunting (1997)',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 1']['Delete']).toBeUndefined()
})

const starWarsCloneTracks = [
  {
    id: 0,
    name: 'Star Wars: Episode II - Attack of the Clones (2002) - PopHD',
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    properties: {
      videoDimensions: '1920x816',
      frames: 204943,
      bitRate: 2199789
    },
    default: true,
    forced: false,
    duration: 8547.831,
    size: 2350428699,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'AC3-5.1-VFQ',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 267072,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 8546.304,
    size: 478593024,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'AC3-5.1-VO',
    type: 'Audio',
    codec: 'AC-3',
    language: 'en',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 267121,
      bitRate: 448000
    },
    default: true,
    forced: false,
    duration: 8547.872,
    size: 478680832,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'AC3-5.1-VFF',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 267120,
      bitRate: 448000
    },
    default: false,
    forced: false,
    duration: 8547.84,
    size: 478679040,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    name: 'forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 17,
      bitRate: 1
    },
    default: true,
    forced: false,
    duration: 6954.491,
    size: 1371,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    name: 'full',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 1178,
      bitRate: 38
    },
    default: false,
    forced: false,
    duration: 8410.409,
    size: 40600,
    copy: true,
    unsupported: false
  },
  {
    id: 6,
    name: 'forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en',
    properties: {
      textSubtitles: true,
      frames: 17,
      bitRate: 1
    },
    default: false,
    forced: false,
    duration: 8234.479,
    size: 1331,
    copy: true,
    unsupported: false
  },
  {
    id: 7,
    name: 'full',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'en',
    properties: {
      textSubtitles: true,
      frames: 1212,
      bitRate: 42
    },
    default: false,
    forced: false,
    duration: 7900.637,
    size: 41933,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Star Wars Clone VFQ no delete bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    starWarsCloneTracks,
    'C:\\Download\\bugs\\Star Wars - Episode II - Attack of the Clones (2002).mkv',
    "Star Wars, épisode II - L'Attaque des clones (2002)",
    defaultPoster1,
    "Star Wars, épisode II - L'Attaque des clones (2002)",
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 1']['Delete']).toBeDefined()
})

const superman2Tracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x800',
      frames: 183409,
      bitRate: 2393382
    },
    default: true,
    forced: false,
    duration: 7649.678,
    size: 2288575238,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'VFF 1.0',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 1,
      audioSamplingFrequency: 48000,
      frames: 239083,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 7650.656,
    size: 612052480,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'VO 5.1',
    type: 'Audio',
    codec: 'AC-3',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 239081,
      bitRate: 640000
    },
    default: false,
    forced: false,
    duration: 7650.592,
    size: 612047360,
    copy: false,
    unsupported: false
  },
  {
    id: 3,
    name: 'Full',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 947,
      bitRate: 29
    },
    default: false,
    forced: false,
    duration: 7566.308,
    size: 28195,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Superman 2 delete VO bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    superman2Tracks,
    'C:\\Download\\bugs\\Superman II (1980).mkv',
    'Superman II (1980)',
    defaultPoster1,
    'Superman II (1980)',
    [],
    0,
    Languages.getLanguageByCode('en-US'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Audio 2']['Delete']).toBeUndefined()
  const hints = hintListToMap(results.hints)
  expect(hints['Language 2']).toBe('en-US')
})

const morganTracks = [
  {
    id: 0,
    name: '1080p',
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1920x1080',
      frames: 132172,
      bitRate: 3495962,
      fps: 23.976
    },
    default: true,
    forced: false,
    duration: 5512.674,
    size: 2409013002,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'VFF DTS 5.1 @768 kbps',
    type: 'Audio',
    codec: 'DTS',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 516814,
      bitRate: 767999,
      fps: 94
    },
    default: true,
    forced: false,
    duration: 5512.683,
    size: 529217536,
    copy: true,
    unsupported: false
  },
  {
    id: 2,
    name: 'SRT Forcés',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 18,
      bitRate: 1,
      fps: 0
    },
    default: true,
    forced: true,
    duration: 4084.247,
    size: 588,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'SRT Complets',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    properties: {
      textSubtitles: true,
      frames: 1045,
      bitRate: 45,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 5459.412,
    size: 30742,
    copy: false,
    unsupported: false
  },
  {
    id: 4,
    name: 'PGS Forcés',
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fr',
    properties: {
      frames: 36,
      bitRate: 495,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 4084.247,
    size: 253221,
    copy: true,
    unsupported: false
  },
  {
    id: 5,
    name: 'PGS Complets',
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'fr',
    properties: {
      frames: 2090,
      bitRate: 11416,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 5459.412,
    size: 7790585,
    copy: true,
    unsupported: false
  },
  {
    id: 6,
    name: 'PGS Forcés',
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'en',
    properties: {
      frames: 28,
      bitRate: 218,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 2574.03,
    size: 70417,
    copy: true,
    unsupported: false
  },
  {
    id: 7,
    name: 'PGS Complets',
    type: 'Subtitles',
    codec: 'HDMV PGS',
    language: 'en',
    properties: {
      frames: 2114,
      bitRate: 12956,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 5042.371,
    size: 8166717,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Morgan delete unknown language bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    morganTracks,
    'C:\\Download\\bugs\\Morgan (2016).mkv',
    'Morgane (2016)',
    defaultPoster1,
    'Morgane (2016)',
    [],
    0,
    Languages.getLanguageByCode('en'),
    [Countries.getCountryByCode('US'), Countries.getCountryByCode('GB')],
    [],
    []
  )
  const changes = changeListToMap(results.changes)
  expect(changes['Subtitles 3']['Delete']).toBeUndefined()
  const hints = hintListToMap(results.hints)
  expect(hints['Language 3']).toBe('')
})

const hackerTracks = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'da',
    properties: {
      videoDimensions: '1920x800',
      frames: 139743,
      bitRate: 2698095,
      fps: 24
    },
    default: false,
    forced: false,
    duration: 5822.625,
    size: 1963750023,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    name: 'VO 2.0',
    type: 'Audio',
    codec: 'AAC',
    language: 'da',
    properties: {
      audioChannels: 2,
      audioSamplingFrequency: 48000,
      frames: 272889,
      bitRate: 128557,
      fps: 47
    },
    default: false,
    forced: false,
    duration: 5821.632,
    size: 93551922,
    copy: false,
    unsupported: false
  },
  {
    id: 2,
    name: 'VF 5.1',
    type: 'Audio',
    codec: 'AC-3',
    language: 'fr',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 182122,
      bitRate: 448000,
      fps: 31
    },
    default: false,
    forced: false,
    duration: 5827.904,
    size: 326362624,
    copy: true,
    unsupported: false
  },
  {
    id: 3,
    name: 'Full',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 940,
      bitRate: 41,
      fps: 0
    },
    default: false,
    forced: false,
    duration: 5778.666,
    size: 30214,
    copy: true,
    unsupported: false
  },
  {
    id: 4,
    name: 'Forced',
    type: 'Subtitles',
    codec: 'SubRip/SRT',
    language: 'fr',
    properties: {
      textSubtitles: true,
      frames: 18,
      bitRate: 0,
      fps: 0
    },
    default: false,
    forced: true,
    duration: 4917.293,
    size: 542,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Hacker VO delete bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    hackerTracks,
    'C:\\Download\\bugs\\Hacker (2019).mkv',
    'Code poursuite (2019)',
    defaultPoster1,
    'Hacker (2019)',
    [],
    0,
    Languages.getLanguageByCode('da'),
    [Countries.getCountryByCode('DK')],
    [],
    []
  )
  const hints = hintListToMap(results.hints)
  expect(hints['Language 1']).toBeUndefined()
  expect(hints['Language 3']).toBeUndefined()
  expect(hints['Language 4']).toBeUndefined()
})

const blueBloods = [
  {
    id: 0,
    type: 'Video',
    codec: 'AVC/H.264/MPEG-4p10',
    language: 'en',
    properties: {
      videoDimensions: '1280x720',
      frames: 60722,
      bitRate: 2257724,
      fps: 23.976
    },
    default: true,
    forced: false,
    duration: 2532.614,
    size: 714743197,
    copy: true,
    unsupported: false
  },
  {
    id: 1,
    type: 'Audio',
    codec: 'AC-3',
    language: 'und',
    properties: {
      audioChannels: 6,
      audioSamplingFrequency: 48000,
      frames: 79143,
      bitRate: 384000
    },
    default: true,
    forced: false,
    duration: 2532.576,
    size: 121563648,
    copy: true,
    unsupported: false
  }
] as Track[]
test('Blue bloods bug', () => {
  currentSettings.isTrackFilteringEnabled = true
  currentSettings.favoriteLanguages = ['fr-FR']
  currentSettings.isKeepVOEnabled = true
  const results = Brain.getInstance().analyse(
    blueBloods,
    'C:\\Download\\bugs\\Blue Bloods - S1E01.mkv',
    'Blue Bloods',
    defaultPoster1,
    'Blue Bloods',
    [],
    0,
    Languages.getLanguageByCode('en'),
    [Countries.getCountryByCode('US')],
    [],
    []
  )
  const hints = hintListToMap(results.hints)
  expect(hints['Language 1']).toBe('und')
})
