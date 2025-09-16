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

import { Button, Field, Image, Input, MessageBar, MessageBarGroup, Select } from '@fluentui/react-components'
import { Search16Regular } from '@fluentui/react-icons'
import { useState } from 'react'
import { IVideo, SearchBy, VideoType } from '../../../../common/@types/Video'
import { SearchResultList } from '@renderer/components/preview/SearchResults'
import { VideoPreview } from '@renderer/components/preview/VideoPreview'
import { EditionType } from '../../../../common/@types/Movie'
import { EpisodeOrder } from '../../../../main/domain/clients/TVDBClient'
import { ISearchResult } from '../../../../common/@types/SearchResult'
import { FileSelectorField } from '@renderer/components/fields/FileSelectorField'
import { LanguageSelector } from '@renderer/components/LanguageSelector'

type Props = {
  video: IVideo
}

export const Matching = ({ video }: Props) => {
  const [searchError, setSearchError] = useState<string | undefined>(undefined)

  return (
    <>
      <div className="matching-form">
        <div>
          <Field size="small" label="Type">
            <Select
              value={video.type}
              onChange={async (_ev, data) => {
                await window.api.video.setType(video.uuid, data.value as VideoType)
                await window.api.video.setSearchBy(video.uuid, SearchBy.TITLE)
              }}
            >
              {Object.values(VideoType).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </Select>
          </Field>
        </div>
        {video.movie !== undefined && (
          <>
            <div>
              <Field size="small" label="Search By">
                <Select
                  value={video.searchBy}
                  onChange={async (_ev, data) => {
                    await window.api.video.setSearchBy(video.uuid, data.value as SearchBy)
                  }}
                >
                  <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                  <option key={SearchBy.IMDB}>{SearchBy.IMDB}</option>
                  <option key={SearchBy.TMDB}>{SearchBy.TMDB}</option>
                </Select>
              </Field>
            </div>
            {video.searchBy === SearchBy.TITLE && (
              <>
                <div className="growing-form-field">
                  <Field size="small" label="Title" required>
                    <Input
                      value={video.movie.title || ''}
                      onChange={async (_ev, data) => await window.api.video.movie.setTitle(video.uuid, data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Year">
                    <Input
                      type="number"
                      value={video.movie.year ? '' + video.movie.year : ''}
                      style={{ minWidth: 1, maxWidth: 72 }}
                      onChange={async (_ev, data) => await window.api.video.movie.setYear(video.uuid, data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            {video.searchBy === SearchBy.IMDB && (
              <div>
                <Field size="small" label="IMDB ID" required>
                  <Input
                    value={video.movie.imdb || ''}
                    onChange={async (_ev, data) => await window.api.video.movie.setIMDB(video.uuid, data.value)}
                  />
                </Field>
              </div>
            )}
            {video.searchBy === SearchBy.TMDB && (
              <div>
                <Field size="small" label="TMDB ID" required>
                  <Input
                    value={video.movie.tmdb ? '' + video.movie.tmdb : ''}
                    type="number"
                    onChange={async (_ev, data) => await window.api.video.movie.setTMDB(video.uuid, data.value)}
                  />
                </Field>
              </div>
            )}
            <Field size="small" label="Edition">
              <Select
                value={video.movie.edition}
                onChange={async (_ev, data) =>
                  await window.api.video.movie.setEdition(video.uuid, data.value as EditionType)
                }
              >
                {Object.values(EditionType).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
        {video.tvShow !== undefined && (
          <>
            <div>
              <Field size="small" label="Search By">
                <Select
                  value={video.searchBy}
                  onChange={async (_ev, data) => await window.api.video.setSearchBy(video.uuid, data.value as SearchBy)}
                >
                  <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                  <option key={SearchBy.TVDB}>{SearchBy.TVDB}</option>
                </Select>
              </Field>
            </div>
            {video.searchBy === SearchBy.TITLE && (
              <>
                <div>
                  <Field size="small" label="Title" required>
                    <Input
                      value={video.tvShow.title || ''}
                      onChange={async (_ev, data) => await window.api.video.tvShow.setTitle(video.uuid, data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Year">
                    <Input
                      type="number"
                      value={video.tvShow.year ? '' + video.tvShow.year : ''}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.tvShow.setYear(video.uuid, data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            {video.searchBy === SearchBy.TVDB && (
              <>
                <div>
                  <Field size="small" label="TVDB ID" required>
                    <Input
                      value={video.tvShow.theTVDB ? '' + video.tvShow.theTVDB : ''}
                      onChange={async (_ev, data) => await window.api.video.tvShow.setTheTVDB(video.uuid, data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            <div>
              <Field size="small" label="Order">
                <Select
                  value={video.tvShow.order}
                  onChange={async (_ev, data) =>
                    await window.api.video.tvShow.setOrder(video.uuid, data.value as EpisodeOrder)
                  }
                >
                  <option value="official">Official</option>
                  <option value="dvd">DVD</option>
                  <option value="absolute">Absolute</option>
                </Select>
              </Field>
            </div>
            {video.tvShow.order !== 'absolute' ? (
              <>
                <div>
                  <Field size="small" label="Season" required>
                    <Input
                      type="number"
                      value={!video.tvShow.season ? '' : '' + video.tvShow.season}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.tvShow.setSeason(video.uuid, data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Episode" required>
                    <Input
                      type="number"
                      value={!video.tvShow.episode ? '' : '' + video.tvShow.episode}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.tvShow.setEpisode(video.uuid, data.value)}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <div>
                <Field size="small" label="Episode" required>
                  <Input
                    type="number"
                    value={!video.tvShow.absoluteEpisode ? '' : '' + video.tvShow.absoluteEpisode}
                    style={{ minWidth: 1 }}
                    onChange={async (_ev, data) =>
                      await window.api.video.tvShow.setAbsoluteEpisode(video.uuid, data.value)
                    }
                  />
                </Field>
              </div>
            )}
          </>
        )}
        {video.other !== undefined && (
          <>
            <div className="growing-form-field">
              <Field size="small" label="Title" required>
                <Input
                  value={video.other.title || ''}
                  onChange={async (_ev, data) => await window.api.video.other.setTitle(video.uuid, data.value)}
                />
              </Field>
            </div>
          </>
        )}
        <div className="buttons">
          {video.type === VideoType.OTHER ? (
            <Button
              disabled={
                !video.other?.title ||
                (!video.other.year && (!!video.other.day || !!video.other.month)) ||
                (!video.other.month && !!video.other.day)
              }
              size={'small'}
              appearance={'primary'}
              onClick={async () =>
                await window.api.video
                  .search(video.uuid)
                  .then(() => setSearchError(undefined))
                  .catch((error) => setSearchError((error as Error).message))
              }
            >
              Analyse
            </Button>
          ) : (
            <Button
              size={'small'}
              appearance={'primary'}
              icon={<Search16Regular />}
              onClick={async () =>
                await window.api.video
                  .search(video.uuid)
                  .then(() => setSearchError(undefined))
                  .catch((error) => setSearchError((error as Error).message))
              }
            >
              Search
            </Button>
          )}
        </div>
      </div>
      {searchError !== undefined ? (
        <MessageBarGroup>
          <MessageBar shape="rounded" intent={'error'}>
            {searchError}
          </MessageBar>
        </MessageBarGroup>
      ) : (
        <>
          {video.other && (
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', flexFlow: 'column', flexGrow: 1 }}>
                <div className="matching-form">
                  <Field size="small" label="Year">
                    <Input
                      type="number"
                      required={!!video.other.day || !!video.other.month}
                      value={video.other.year ? '' + video.other.year : ''}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.other.setYear(video.uuid, data.value)}
                    />
                  </Field>
                  <Field size="small" label="Month">
                    <Input
                      type="number"
                      required={!!video.other.day}
                      value={video.other.month ? '' + video.other.month : ''}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.other.setMonth(video.uuid, data.value)}
                    />
                  </Field>
                  <Field size="small" label="Day">
                    <Input
                      type="number"
                      value={video.other.day ? '' + video.other.day : ''}
                      style={{ minWidth: 1 }}
                      onChange={async (_ev, data) => await window.api.video.other.setDay(video.uuid, data.value)}
                    />
                  </Field>
                  <Field size="small" label="Original Language">
                    <LanguageSelector
                      size={'small'}
                      id="customOriginalLanguage"
                      multiselect={false}
                      value={video.other.originalLanguage?.code || ''}
                      onChange={async (value: string) =>
                        await window.api.video.other.setOriginalLanguage(video.uuid, value)
                      }
                    />
                  </Field>
                </div>
                <div className="matching-form">
                  <FileSelectorField
                    clearable
                    label="JPG Poster Path"
                    size={'small'}
                    value={video.other.poster || ''}
                    onChange={async (newFile) => await window.api.video.other.setPosterPath(video.uuid, newFile)}
                  />
                </div>
              </div>
              <Image
                style={{
                  border: '1px solid #7f7f7f',
                  minWidth: !video.other.poster ? '173px' : '0',
                  width: 'auto',
                  height: '173px'
                }}
                alt="No Poster"
                bordered
                src={video.other.poster ? 'svp:///' + video.other.poster : ''}
                className="poster"
              />
            </div>
          )}
          {video.other === undefined && (
            <div className={'matching-results'}>
              <SearchResultList
                results={video.searchResults}
                onSelectionChange={async (selection: ISearchResult | undefined) =>
                  await window.api.video
                    .selectSearchResultID(video.uuid, selection?.id)
                    .then(() => setSearchError(undefined))
                    .catch((error) => setSearchError((error as Error).message))
                }
                selectedID={video.selectedSearchResultID}
              />

              <div className="preview-space">
                {video.movie !== undefined && (
                  <VideoPreview
                    title={video.movie.title}
                    poster={video.movie.poster}
                    overview={video.movie.overview}
                    countries={video.movie.originalCountries}
                    year={video.movie.year}
                    rating={video.movie.rating}
                  />
                )}
                {video.tvShow !== undefined && (
                  <VideoPreview
                    title={video.tvShow.title}
                    subTitle={video.tvShow.episodeTitle}
                    poster={video.tvShow.poster}
                    overview={video.tvShow.episodeOverview ?? video.tvShow.overview}
                    altOverview={video.tvShow.episodeOverview !== undefined ? video.tvShow.overview : undefined}
                    year={video.tvShow.year}
                    countries={video.tvShow.originalCountries}
                    secondaryPoster={video.tvShow.episodePoster}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
