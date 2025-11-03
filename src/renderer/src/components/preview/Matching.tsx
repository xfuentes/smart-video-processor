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
import { useEffect, useState } from 'react'
import { IVideo, SearchBy, SearchInputData, VideoType } from '../../../../common/@types/Video'
import { SearchResultList } from '@renderer/components/preview/SearchResults'
import { VideoPreview } from '@renderer/components/preview/VideoPreview'
import { EditionType } from '../../../../common/@types/Movie'
import { EpisodeOrder } from '../../../../main/domain/clients/TVDBClient'
import { ISearchResult } from '../../../../common/@types/SearchResult'
import { FileSelectorField } from '@renderer/components/fields/FileSelectorField'
import { LanguageSelector } from '@renderer/components/LanguageSelector'

type Props = {
  video: IVideo
  disabled?: boolean
}

export const Matching = ({ video, disabled }: Props) => {
  const [searchError, setSearchError] = useState<string | undefined>(undefined)
  const [type, setType] = useState<VideoType>(video.type)
  const [searchBy, setSearchBy] = useState<SearchBy>(video.searchBy)

  const [movieTitle, setMovieTitle] = useState<string>(video.movie?.title ?? '')
  const [movieYear, setMovieYear] = useState<string>(video.movie?.year ? '' + video.movie.year : '')
  const [movieIMDB, setMovieIMDB] = useState<string>(video.movie?.imdb ? video.movie.imdb : '')
  const [movieTMDB, setMovieTMDB] = useState<string>(video.movie?.tmdb ? '' + video.movie.tmdb : '')
  const [movieEdition, setMovieEdition] = useState<EditionType>(video.movie?.edition ?? EditionType.THEATRICAL)

  const [tvShowTitle, setTvShowTitle] = useState<string>(video.tvShow?.title ?? '')
  const [tvShowYear, setTvShowYear] = useState<string>(video.tvShow?.year ? '' + video.tvShow.year : '')
  const [tvShowTVDB, setTvShowTVDB] = useState<string>(video.tvShow?.theTVDB ? '' + video.tvShow.theTVDB : '')
  const [tvShowOrder, setTvShowOrder] = useState<EpisodeOrder>(video.tvShow?.order ?? 'official')
  const [tvShowSeason, setTvShowSeason] = useState<string>(!video.tvShow?.season ? '' : '' + video.tvShow.season)
  const [tvShowEpisode, setTvShowEpisode] = useState<string>(!video.tvShow?.episode ? '' : '' + video.tvShow.episode)
  const [tvShowAbsoluteEpisode, setTvShowAbsoluteEpisode] = useState<string>(
    !video.tvShow?.absoluteEpisode ? '' : '' + video.tvShow.absoluteEpisode
  )

  const [otherTitle, setOtherTitle] = useState<string>(video.other?.title ?? '')
  const [otherYear, setOtherYear] = useState<string>(video.other?.year ? '' + video.other.year : '')
  const [otherMonth, setOtherMonth] = useState<string>(video.other?.month ? '' + video.other.month : '')
  const [otherDay, setOtherDay] = useState<string>(video.other?.day ? '' + video.other.day : '')
  const [otherOriginalLanguage, setOtherOriginalLanguage] = useState<string>(video.other?.originalLanguage?.code || '')
  const [otherPosterPath, setOtherPosterPath] = useState<string>(video.other?.poster || '')

  useEffect(() => {
    console.log('movie ' + video.filename.substring(video.filename.lastIndexOf('/')) + ' updated!')
    type !== video.type && setType(video.type)
    searchBy !== video.searchBy && setSearchBy(video.searchBy)
    movieTitle !== (video.movie?.title ?? '') && setMovieTitle(video.movie?.title ?? '')
    movieYear !== (video.movie?.year ? '' + video.movie.year : '') &&
      setMovieYear(video.movie?.year ? '' + video.movie.year : '')
    movieIMDB !== (video.movie?.imdb ? video.movie.imdb : '') && setMovieIMDB(video.movie?.imdb ? video.movie.imdb : '')
    movieTMDB !== (video.movie?.tmdb ? '' + video.movie.tmdb : '') &&
      setMovieTMDB(video.movie?.tmdb ? '' + video.movie.tmdb : '')
    movieEdition !== (video.movie?.edition ?? EditionType.THEATRICAL) &&
      setMovieEdition(video.movie?.edition ?? EditionType.THEATRICAL)
    tvShowTitle !== (video.tvShow?.title ?? '') && setTvShowTitle(video.tvShow?.title ?? '')
    tvShowYear !== (video.tvShow?.year ? '' + video.tvShow.year : '') &&
      setTvShowYear(video.tvShow?.year ? '' + video.tvShow.year : '')
    tvShowTVDB !== (video.tvShow?.theTVDB ? '' + video.tvShow.theTVDB : '') &&
      setTvShowTVDB(video.tvShow?.theTVDB ? '' + video.tvShow.theTVDB : '')
    tvShowOrder !== (video.tvShow?.order ?? 'official') && setTvShowOrder(video.tvShow?.order ?? 'official')
    tvShowSeason !== (!video.tvShow?.season ? '' : '' + video.tvShow.season) &&
      setTvShowSeason(!video.tvShow?.season ? '' : '' + video.tvShow.season)
    tvShowEpisode !== (!video.tvShow?.episode ? '' : '' + video.tvShow.episode) &&
      setTvShowEpisode(!video.tvShow?.episode ? '' : '' + video.tvShow.episode)
    tvShowAbsoluteEpisode !== (!video.tvShow?.absoluteEpisode ? '' : '' + video.tvShow.absoluteEpisode) &&
      setTvShowAbsoluteEpisode(!video.tvShow?.absoluteEpisode ? '' : '' + video.tvShow.absoluteEpisode)
    otherTitle !== (video.other?.title ?? '') && setOtherTitle(video.other?.title ?? '')
    otherYear !== (video.other?.year ? '' + video.other.year : '') &&
      setOtherYear(video.other?.year ? '' + video.other.year : '')
    otherMonth !== (video.other?.month ? '' + video.other.month : '') &&
      setOtherMonth(video.other?.month ? '' + video.other.month : '')
    otherDay !== (video.other?.day ? '' + video.other.day : '') &&
      setOtherDay(video.other?.day ? '' + video.other.day : '')
    otherOriginalLanguage !== (video.other?.originalLanguage?.code || '') &&
      setOtherOriginalLanguage(video.other?.originalLanguage?.code || '')
    otherPosterPath !== (video.other?.poster || '') && setOtherPosterPath(video.other?.poster || '')
  }, [video]) // eslint-disable-line

  const search = async () => {
    await window.api.video
      .search(video.uuid, {
        type,
        searchBy,
        movieTitle,
        movieYear,
        movieIMDB,
        movieTMDB,
        movieEdition,
        tvShowTitle,
        tvShowYear,
        tvShowTVDB,
        tvShowOrder,
        tvShowSeason,
        tvShowEpisode,
        tvShowAbsoluteEpisode,
        otherTitle,
        otherYear,
        otherMonth,
        otherDay,
        otherOriginalLanguage,
        otherPosterPath
      } as SearchInputData)
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
              {Object.values(VideoType).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </Select>
          </Field>
        </div>
        {type === VideoType.MOVIE && (
          <>
            <div>
              <Field size="small" label="Search By" required className={disabled ? 'disabled' : ''}>
                <Select
                  value={searchBy}
                  disabled={disabled}
                  onChange={(_ev, data) => setSearchBy(data.value as SearchBy)}
                >
                  <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                  <option key={SearchBy.IMDB}>{SearchBy.IMDB}</option>
                  <option key={SearchBy.TMDB}>{SearchBy.TMDB}</option>
                </Select>
              </Field>
            </div>
            {searchBy === SearchBy.TITLE && (
              <>
                <div className="growing-form-field">
                  <Field size="small" label="Title" required className={disabled ? 'disabled' : ''}>
                    <Input disabled={disabled} value={movieTitle} onChange={(_ev, data) => setMovieTitle(data.value)} />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Year" className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      value={movieYear}
                      disabled={disabled}
                      style={{ minWidth: 1, maxWidth: 72 }}
                      onChange={(_ev, data) => setMovieYear(data.value)}
                    />
                  </Field>
                </div>
              </>
            )}
            {searchBy === SearchBy.IMDB && (
              <div>
                <Field size="small" label="IMDB ID" required className={disabled ? 'disabled' : ''}>
                  <Input disabled={disabled} value={movieIMDB} onChange={(_ev, data) => setMovieIMDB(data.value)} />
                </Field>
              </div>
            )}
            {searchBy === SearchBy.TMDB && (
              <div>
                <Field size="small" label="TMDB ID" required className={disabled ? 'disabled' : ''}>
                  <Input
                    disabled={disabled}
                    value={movieTMDB}
                    type="number"
                    onChange={(_ev, data) => setMovieTMDB(data.value)}
                  />
                </Field>
              </div>
            )}
            <Field size="small" label="Edition" className={disabled ? 'disabled' : ''}>
              <Select
                disabled={disabled}
                value={movieEdition}
                onChange={(_ev, data) => setMovieEdition(data.value as EditionType)}
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
        {type === VideoType.TV_SHOW && (
          <>
            <div>
              <Field size="small" label="Search By" required className={disabled ? 'disabled' : ''}>
                <Select
                  disabled={disabled}
                  value={searchBy}
                  onChange={(_ev, data) => setSearchBy(data.value as SearchBy)}
                >
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
                      value={tvShowTitle}
                      onChange={(_ev, data) => setTvShowTitle(data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Year" className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={tvShowYear}
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
                  <option value="official">Official</option>
                  <option value="dvd">DVD</option>
                  <option value="absolute">Absolute</option>
                </Select>
              </Field>
            </div>
            {tvShowOrder !== 'absolute' ? (
              <>
                <div>
                  <Field size="small" label="Season" required className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={tvShowSeason}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setTvShowSeason(data.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Field size="small" label="Episode" required className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={tvShowEpisode}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setTvShowEpisode(data.value)}
                    />
                  </Field>
                </div>
              </>
            ) : (
              <div>
                <Field size="small" label="Episode" required className={disabled ? 'disabled' : ''}>
                  <Input
                    type="number"
                    disabled={disabled}
                    value={tvShowAbsoluteEpisode}
                    style={{ minWidth: 1 }}
                    onChange={(_ev, data) => setTvShowAbsoluteEpisode(data.value)}
                  />
                </Field>
              </div>
            )}
          </>
        )}
        {type === VideoType.OTHER && (
          <>
            <div className="growing-form-field">
              <Field size="small" label="Title" required className={disabled ? 'disabled' : ''}>
                <Input disabled={disabled} value={otherTitle} onChange={(_ev, data) => setOtherTitle(data.value)} />
              </Field>
            </div>
          </>
        )}
        <div className="buttons">
          {type === VideoType.OTHER ? (
            <Button
              disabled={
                disabled || !otherTitle || (!otherYear && (!!otherDay || !!otherMonth)) || (!otherMonth && !!otherDay)
              }
              size={'small'}
              appearance={'primary'}
              onClick={async () => search()}
            >
              Analyse
            </Button>
          ) : (
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
          {type === VideoType.OTHER && (
            <div style={{ display: 'flex' }}>
              <div style={{ display: 'flex', flexFlow: 'column', flexGrow: 1 }}>
                <div className="matching-form">
                  <Field
                    size="small"
                    label="Year"
                    required={!!otherDay || !!otherMonth}
                    className={disabled ? 'disabled' : ''}
                  >
                    <Input
                      type="number"
                      disabled={disabled}
                      required={!!otherDay || !!otherMonth}
                      value={otherYear ? '' + otherYear : ''}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setOtherYear(data.value)}
                    />
                  </Field>
                  <Field size="small" label="Month" required={!!otherDay} className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      required={!!otherDay}
                      value={otherMonth}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setOtherMonth(data.value)}
                    />
                  </Field>
                  <Field size="small" label="Day" className={disabled ? 'disabled' : ''}>
                    <Input
                      type="number"
                      disabled={disabled}
                      value={otherDay}
                      style={{ minWidth: 1 }}
                      onChange={(_ev, data) => setOtherDay(data.value)}
                    />
                  </Field>
                  <Field size="small" label="Original Language" className={disabled ? 'disabled' : ''}>
                    <LanguageSelector
                      size={'small'}
                      disabled={disabled}
                      id="customOriginalLanguage"
                      multiselect={false}
                      value={otherOriginalLanguage}
                      onChange={(value: string) => setOtherOriginalLanguage(value)}
                    />
                  </Field>
                </div>
                <div className="matching-form">
                  <FileSelectorField
                    clearable
                    disabled={disabled}
                    label="JPG Poster Path"
                    size={'small'}
                    value={otherPosterPath}
                    onChange={(newFile) => setOtherPosterPath(newFile)}
                  />
                </div>
              </div>
              <Image
                style={{
                  border: '1px solid #7f7f7f',
                  minWidth: !otherPosterPath ? '173px' : '0',
                  width: 'auto',
                  height: '173px'
                }}
                alt="No Poster"
                bordered
                src={otherPosterPath ? 'svp:///' + otherPosterPath : ''}
                className="poster"
              />
            </div>
          )}
          {type !== VideoType.OTHER && (
            <div className={'matching-results'}>
              <SearchResultList
                disabled={disabled}
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
                {type === VideoType.MOVIE && (
                  <VideoPreview
                    title={video.movie?.title}
                    poster={video.movie?.poster}
                    overview={video.movie?.overview}
                    countries={video.movie?.originalCountries}
                    year={video.movie?.year}
                    rating={video.movie?.rating}
                  />
                )}
                {type === VideoType.TV_SHOW && (
                  <VideoPreview
                    title={video.tvShow?.title}
                    subTitle={video.tvShow?.episodeTitle}
                    poster={video.tvShow?.poster}
                    overview={video.tvShow?.episodeOverview ?? video.tvShow?.overview}
                    altOverview={video.tvShow?.episodeOverview !== undefined ? video.tvShow.overview : undefined}
                    year={video.tvShow?.year}
                    countries={video.tvShow?.originalCountries}
                    secondaryPoster={video.tvShow?.episodePoster}
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
