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

import { Button, Field, Input, MessageBar, MessageBarGroup, Select } from '@fluentui/react-components'
import { Search16Regular } from '@fluentui/react-icons'
import { useEffect, useState } from 'react'
import { IVideo, MultiSearchInputData, SearchBy, VideoType } from '../../../../common/@types/Video'
import { SearchResultList } from '@renderer/components/preview/SearchResults'
import { VideoPreview } from '@renderer/components/preview/VideoPreview'
import { EpisodeOrder } from '../../../../main/domain/clients/TVDBClient'
import { ISearchResult } from '../../../../common/@types/SearchResult'
import { keepIfSameFilenameReducer, keepIfSameReducer } from '@renderer/utils'
import { Country } from '../../../../common/Countries'

type Props = {
  videos: IVideo[]
  disabled?: boolean
}

export const MultiMatching = ({ videos, disabled }: Props) => {
  const initialType = videos.map((v): VideoType | undefined => v.type).reduce(keepIfSameReducer)
  const initialSearchBy = videos.map((v): SearchBy | undefined => v.searchBy).reduce(keepIfSameReducer)
  const initialTvShowTitle = videos.map((v): string | undefined => v.tvShow?.title).reduce(keepIfSameReducer)
  const initialTvShowYear = videos.map((v): number | undefined => v.tvShow?.year).reduce(keepIfSameReducer)
  const initialTvShowTVDB = videos.map((v): number | undefined => v.tvShow?.theTVDB).reduce(keepIfSameReducer)
  const initialTvShowOrder = videos.map((v): EpisodeOrder | undefined => v.tvShow?.order).reduce(keepIfSameReducer)
  const initialSearchResults = videos.map((v): ISearchResult[] | undefined => v.searchResults).reduce(keepIfSameReducer)
  const initialTvShowPoster = videos
    .map((v): string | undefined => (v.tvShow?.poster === undefined ? undefined : v.tvShow?.poster))
    .reduce(keepIfSameFilenameReducer)
  const initialTvShowEpisodeOverview = videos
    .map((v): string | undefined => v.tvShow?.episodeOverview)
    .reduce(keepIfSameReducer)
  const initialTvShowOverview = videos.map((v): string | undefined => v.tvShow?.overview).reduce(keepIfSameReducer)
  const initialTvShowOriginalCountries = videos
    .map((v): Country[] | undefined => v.tvShow?.originalCountries)
    .reduce(keepIfSameReducer)
  const initialTvShowSeason = videos
    .map((v): string | undefined => (!v.tvShow?.season ? '' : '' + v.tvShow.season))
    .reduce(keepIfSameReducer)

  const [searchError, setSearchError] = useState<string | undefined>(undefined)
  const [type, setType] = useState<VideoType | undefined>(initialType)
  const [searchBy, setSearchBy] = useState<SearchBy | undefined>(initialSearchBy)
  const [tvShowTitle, setTvShowTitle] = useState<string | undefined>(initialTvShowTitle)
  const [tvShowYear, setTvShowYear] = useState<string | undefined>(
    initialTvShowYear !== undefined ? '' + initialTvShowYear : undefined
  )
  const [tvShowTVDB, setTvShowTVDB] = useState<string | undefined>(
    initialTvShowTVDB !== undefined ? '' + initialTvShowTVDB : undefined
  )
  const [tvShowOrder, setTvShowOrder] = useState<EpisodeOrder | undefined>(initialTvShowOrder)
  const [searchResults, setSearchResults] = useState<ISearchResult[] | undefined>(initialSearchResults)
  const [tvShowPoster, setTvShowPoster] = useState<string | undefined>(initialTvShowPoster)
  const [tvShowEpisodeOverview, setTvShowEpisodeOverview] = useState<string | undefined>(initialTvShowEpisodeOverview)
  const [tvShowOverview, setTvShowOverview] = useState<string | undefined>(initialTvShowOverview)
  const [tvShowOriginalCountries, setTvShowOriginalCountries] = useState<Country[] | undefined>(
    initialTvShowOriginalCountries
  )
  const [tvShowSeason, setTvShowSeason] = useState<string | undefined>(initialTvShowSeason)

  useEffect(() => {
    type !== initialType && setType(initialType)
    searchBy !== initialSearchBy && setSearchBy(initialSearchBy)
    tvShowTitle !== initialTvShowTitle && setTvShowTitle(initialTvShowTitle)
    tvShowYear !== initialTvShowYear &&
      setTvShowYear(initialTvShowYear !== undefined ? '' + initialTvShowYear : undefined)
    tvShowTVDB !== initialTvShowTVDB &&
      setTvShowTVDB(initialTvShowTVDB !== undefined ? '' + initialTvShowTVDB : undefined)
    tvShowOrder !== initialTvShowOrder && setTvShowOrder(initialTvShowOrder)

    searchResults !== initialSearchResults && setSearchResults(initialSearchResults)
    tvShowPoster !== initialTvShowPoster && setTvShowPoster(initialTvShowPoster)
    tvShowEpisodeOverview !== initialTvShowEpisodeOverview && setTvShowEpisodeOverview(initialTvShowEpisodeOverview)
    tvShowOverview !== initialTvShowOverview && setTvShowOverview(initialTvShowOverview)
    tvShowOriginalCountries !== initialTvShowOriginalCountries &&
      setTvShowOriginalCountries(initialTvShowOriginalCountries)
    tvShowSeason !== initialTvShowSeason && setTvShowSeason(initialTvShowSeason)
  }, [videos]) // eslint-disable-line

  const search = async () => {
    await window.api.video
      .multiSearch(
        videos.map((v) => v.uuid),
        {
          type,
          searchBy,
          tvShowTitle,
          tvShowYear,
          tvShowTVDB,
          tvShowOrder,
          tvShowSeason
        } as MultiSearchInputData
      )
      .then(() => {
        setSearchError(undefined)
      })
      .catch((error) => setSearchError((error as Error).message))
  }

  return (
    <>
      <div className="matching-form">
        <div>
          <Field size="small" label="Type" required className={disabled ? 'disabled' : ''}>
            <Select
              disabled={disabled}
              value={type}
              onChange={(_ev, data) => {
                setType(data.value as VideoType)
                setSearchBy(SearchBy.TITLE)
              }}
            >
              {initialType === undefined && (
                <option key={undefined} value={undefined}>
                  Multiple values
                </option>
              )}
              {Object.values(VideoType).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </Select>
          </Field>
        </div>
        {type === VideoType.TV_SHOW && (
          <>
            <div>
              <Field size="small" label="Search By" required className={disabled ? 'disabled' : ''}>
                <Select
                  disabled={disabled}
                  value={searchBy}
                  onChange={(_ev, data) => setSearchBy(data.value as SearchBy)}
                >
                  {initialSearchBy === undefined && (
                    <option key={undefined} value={undefined}>
                      Multiple values
                    </option>
                  )}
                  <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                  <option key={SearchBy.TVDB}>{SearchBy.TVDB}</option>
                </Select>
              </Field>
            </div>
            {searchBy === SearchBy.TITLE && (
              <>
                <div>
                  <Field size="small" label="Title" required className={disabled ? 'disabled' : ''}>
                    <Input
                      disabled={disabled}
                      value={tvShowTitle ?? ''}
                      onChange={(_ev, data) => setTvShowTitle(data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Year" className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={tvShowYear ?? ''}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setTvShowYear(data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            {searchBy === SearchBy.TVDB && (
              <>
                <div>
                  <Field size="small" label="TVDB ID" required className={disabled ? 'disabled' : ''}>
                    <Input disabled={disabled} value={tvShowTVDB} onChange={(_ev, data) => setTvShowTVDB(data.value)} />
                  </Field>
                </div>
              </>
            )}
            <div>
              <Field size="small" label="Order" className={disabled ? 'disabled' : ''}>
                <Select
                  disabled={disabled}
                  value={tvShowOrder}
                  onChange={(_ev, data) => setTvShowOrder(data.value as EpisodeOrder)}
                >
                  {initialTvShowOrder === undefined && (
                    <option key={undefined} value={undefined}>
                      Multiple values
                    </option>
                  )}
                  <option value="official">Official</option>
                  <option value="dvd">DVD</option>
                  <option value="absolute">Absolute</option>
                </Select>
              </Field>
            </div>
            {tvShowOrder !== 'absolute' && (
              <>
                <div>
                  <Field size="small" label="Season" required className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={tvShowSeason ?? ''}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setTvShowSeason(data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
          </>
        )}
        <div className="buttons">
          {type === VideoType.TV_SHOW && (
            <Button
              disabled={disabled}
              size={'small'}
              appearance={'primary'}
              icon={<Search16Regular />}
              onClick={async () => search()}
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
          {type === VideoType.TV_SHOW && (
            <div className={'matching-results'}>
              <SearchResultList
                disabled={disabled}
                results={searchResults ?? []}
                onSelectionChange={async (selection: ISearchResult | undefined) =>
                  await window.api.video
                    .multiSelectSearchResultID(
                      videos.map((v) => v.uuid),
                      selection?.id
                    )
                    .then(() => setSearchError(undefined))
                    .catch((error) => setSearchError((error as Error).message))
                }
                selectedID={videos[0].selectedSearchResultID}
              />

              <div className="preview-space">
                {type === VideoType.TV_SHOW && (
                  <VideoPreview
                    title={tvShowTitle}
                    poster={tvShowPoster}
                    overview={tvShowEpisodeOverview ?? tvShowOverview}
                    altOverview={tvShowEpisodeOverview !== undefined ? tvShowOverview : undefined}
                    year={tvShowYear}
                    countries={tvShowOriginalCountries}
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
