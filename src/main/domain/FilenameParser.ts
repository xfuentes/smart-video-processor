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

import { Files } from '../util/files'

export interface ParsedFilename {
  title?: string
  year?: number
  season?: number
  episode?: number
  episodeTitle?: string
  absoluteEpisode?: number
}

type MatchResult = {
  title?: string
  season?: number
  episode?: number
  episodeTitle?: string
  absoluteEpisode?: number
  markerIndex?: number
}

const YEAR_PATTERN = /\b(19\d{2}|20\d{2})\b/

function extractYear(input: string, beforeIndex?: number): number | undefined {
  const text = beforeIndex !== undefined ? input.substring(0, beforeIndex) : input
  const match = text.match(YEAR_PATTERN)
  if (!match) {
    return undefined
  }
  return Number.parseInt(match[1], 10)
}

function cleanupTitle(title: string): string {
  title = title.replace(/[()[\]_.,\-–]+$/, '')
  title = title.replace(/[.\-_–]+/g, ' ')
  // Rebuild dotted acronyms like "T W D" -> "T.W.D"
  title = title.replace(/\b([A-Z])\s(?=[A-Z]\b)/g, '$1.')
  return Files.megaTrim(title)
}

function normalize(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

const RELEASE_NOISE_PATTERN =
  /\b(Webrip|WEBRip|WEB-DL|Web-DL|HEVC|H264|H265|x264|x265|Notag|NoTag|MULTI|Multi|FRENCH|VFF|VO|VOSTFR|1080p|720p|2160p|4K|BluRay|BDRip|HDRip|DVDRip|HDTV|AAC|ACC|AC3|DDP5\.1|DTS|HDLight|VFI|VFQ|VOST|SUBFRENCH|COMPLETE|REPACK|PROPER|EXTENDED|UNRATED|REMASTERED|WEB|DL)\b/gi

function removeReleaseNoise(input: string): string {
  let cleaned = input.replace(RELEASE_NOISE_PATTERN, '')
  cleaned = cleaned.replace(/[\s.\-_–]+/g, ' ').trim()
  return Files.megaTrim(cleaned)
}

function tryPatterns(input: string): MatchResult {
  const normalized = normalize(input)

  // Season + episode name, no episode number: "S01E - The Episode Name" or "S01 - The Episode Name"
  let match = /^(?<title>.+?)[.\-_\s]+[Ss](?<season>\d{1,3})\s*[Ee]?\s*[-–]\s*(?<episodeTitle>.+)$/.exec(normalized)
  if (match?.groups) {
    const episodeTitle = removeReleaseNoise(match.groups.episodeTitle)
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episodeTitle: episodeTitle ? episodeTitle : undefined,
      markerIndex: match.index
    }
  }

  // Multi-episode: S01E01E02 or S01E01-E02
  match = /^(?<title>.+?)[.\-_\s]+[Ss](?<season>\d{1,3})[Ee](?<episode>\d{2,4})(?:[Ee]\d{2,4})+/.exec(normalized)
  if (match?.groups) {
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episode: Number.parseInt(match.groups.episode, 10),
      markerIndex: match.index
    }
  }

  // Standard SxxEyy with 2 to 4 episode digits (supports S12E003)
  match = /^(?<title>.+?)[.\-_\s]+[Ss](?<season>\d{1,3})[Ee](?<episode>\d{2,4})\b/.exec(normalized)
  if (match?.groups) {
    const rest = normalized.substring(match.index + match[0].length).trim()
    const rawEpisodeTitle = rest.match(/^[-–]\s*(.+)$/)?.[1]
    const episodeTitle = rawEpisodeTitle ? removeReleaseNoise(rawEpisodeTitle) : undefined
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episode: Number.parseInt(match.groups.episode, 10),
      episodeTitle: episodeTitle ? episodeTitle : undefined,
      markerIndex: match.index
    }
  }

  // 1x01
  match = /^(?<title>.+?)[.\-_\s]+(?<season>\d{1,3})[xX](?<episode>\d{2,4})\b/.exec(normalized)
  if (match?.groups) {
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episode: Number.parseInt(match.groups.episode, 10),
      markerIndex: match.index
    }
  }

  // French: saison X épisode Y
  match =
    /^(?<title>.+?)[.\-_\s]+(?:saison|season)\s*(?<season>\d{1,3})[.\-_\s]*(?:[ée]pisode|ep)\s*(?<episode>\d{1,3})\b/iu.exec(
      normalized
    )
  if (match?.groups) {
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episode: Number.parseInt(match.groups.episode, 10),
      markerIndex: match.index
    }
  }

  // Season alone: Sxx or Saison xx (not followed by E or episode)
  match = /^(?<title>.+?)[.\-_\s]+(?:saison|season)?\s*[Ss](?<season>\d{1,3})(?!\s*[Ee]\d)\b/iu.exec(normalized)
  if (match?.groups) {
    const rest = normalized.substring(match.index + match[0].length).trim()
    const rawEpisodeTitle = rest.match(/^[-–]\s*(.+)$/)?.[1]
    const episodeTitle = rawEpisodeTitle ? removeReleaseNoise(rawEpisodeTitle) : undefined
    return {
      title: cleanupTitle(match.groups.title),
      season: Number.parseInt(match.groups.season, 10),
      episodeTitle: episodeTitle ? episodeTitle : undefined,
      markerIndex: match.index
    }
  }

  // Absolute episode: "Episode 123" or "E123"
  match = /^(?<title>.+?)[.\-_\s]+(?:[ée]pisode|ep)?\s*[Ee](?<episode>\d{2,4})\b/iu.exec(normalized)
  if (match?.groups) {
    return {
      title: cleanupTitle(match.groups.title),
      episode: Number.parseInt(match.groups.episode, 10),
      markerIndex: match.index
    }
  }

  // Title - Episode title without explicit season/episode/year
  if (!YEAR_PATTERN.test(normalized)) {
    match = /^(?<title>.+?)\s*[-–]\s*(?<episodeTitle>.+)$/.exec(normalized)
    if (match?.groups) {
      const episodeTitle = removeReleaseNoise(match.groups.episodeTitle)
      return {
        title: cleanupTitle(match.groups.title),
        episodeTitle: episodeTitle ? episodeTitle : undefined
      }
    }
  }

  return {}
}

export function parseFilename(filename: string): ParsedFilename {
  const normalized = normalize(filename)
  const match = tryPatterns(normalized)

  const result: ParsedFilename = {
    title: match.title,
    season: match.season,
    episode: match.episode,
    episodeTitle: match.episodeTitle,
    absoluteEpisode: match.absoluteEpisode
  }

  const yearSource = match.title ?? normalized
  const year = extractYear(yearSource)
  if (year !== undefined) {
    result.year = year
    // Truncate title at the year position
    const yearMatch = yearSource.match(YEAR_PATTERN)
    if (yearMatch && yearMatch.index !== undefined) {
      result.title = cleanupTitle(yearSource.substring(0, yearMatch.index))
    }
  }

  if (!result.title && !match.title) {
    result.title = cleanupTitle(normalized)
  }

  return result
}
