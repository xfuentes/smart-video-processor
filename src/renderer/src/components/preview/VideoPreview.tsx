/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { Image, Link, RatingDisplay, Tooltip } from '@fluentui/react-components'
import { useI18n } from '../../i18n'
import { Country } from '../../../../common/Countries'
import TMDBLogo from '../../assets/tmdb.svg'
import TVDBLogo from '../../assets/tvdb.svg'
import { IDatabaseLink } from '../../../../common/@types/DatabaseLink'

const DATABASE_LOGOS: Record<string, { src: string; background: string }> = {
  TheTVDB: { src: TVDBLogo, background: 'black' },
  TheMovieDB: { src: TMDBLogo, background: 'rgb(3, 37, 65)' }
}

type Props = {
  poster: string | undefined
  secondaryPoster?: string
  title: string | undefined
  year: string | number | undefined
  subTitle?: string
  position?: string
  overview?: string | undefined
  altOverview?: string
  countries?: Country[]
  rating?: number
  genres?: string[]
  database?: IDatabaseLink
}

export const VideoPreview = ({
  title,
  year,
  poster,
  overview,
  altOverview,
  secondaryPoster,
  subTitle,
  position,
  countries,
  rating,
  genres,
  database
}: Props) => {
  const _ = useI18n()
  return (
    <div className="video-preview">
      {altOverview ? (
        <Tooltip content={altOverview} relationship="description">
          <div
            className="poster"
            style={{
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'no-repeat',
              ...(poster ? { backgroundImage: `url('${'svp:///' + poster.replaceAll('\\', '/')}')` } : {})
            }}
          />
        </Tooltip>
      ) : (
        <div
          className="poster"
          style={{
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'no-repeat',
            ...(poster ? { backgroundImage: `url('${'svp:///' + poster.replaceAll('\\', '/')}')` } : {})
          }}
        />
      )}
      <div className="vertical-stack" style={{ justifyContent: 'space-between', flexGrow: 1, flex: '3' }}>
        <div>
          <div
            style={{
              justifyContent: 'space-between',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gridTemplateRows: '1fr'
            }}
          >
            <div className="title">
              <Tooltip
                content={
                  title +
                  (year ? ` (${year})` : '') +
                  (position ? ` - ${position}` : '') +
                  (genres && genres.length > 0 ? ` | ${genres.join(', ')}` : '')
                }
                relationship="description"
              >
                <div className="shrinkable-text">
                  {title}
                  {year ? ` (${year})` : ''}
                  {position ? ` - ${position}` : ''}
                </div>
              </Tooltip>
            </div>
            <div className="flagNote">
              {rating !== undefined && (
                <div style={{ flexShrink: 0 }}>
                  <RatingDisplay size="small" color="brand" value={Math.round(rating * 10) / 10} valueText={<span />} />
                </div>
              )}
              {countries &&
                countries.map((country) => (
                  <div key={country.alpha3} style={{ flexShrink: 0, justifyContent: 'end', maxHeight: '24px' }}>
                    <Tooltip content={country.label} relationship="description" positioning="below-end">
                      <Image alt={country.label} width="32px" src={country.flagURL.replace('file://', 'svp://')} />
                    </Tooltip>
                  </div>
                ))}
            </div>
          </div>
          {subTitle && (
            <div className="sub-title">
              <Tooltip content={subTitle} relationship="description">
                <div className="shrinkable-text">{subTitle}</div>
              </Tooltip>
            </div>
          )}
        </div>
        {(overview || secondaryPoster || database) && (
          <div
            style={{
              columnGap: '5px',
              display: 'grid',
              flexGrow: 1,
              gridTemplateColumns: '1fr auto',
              gridTemplateRows: '1fr 70px',
              height: 0
            }}
          >
            <div className="overview">{overview ? overview : ''}</div>
            {database && (
              <div
                style={{
                  // A series shows the link above the episode image, a movie in the image slot.
                  gridRow: subTitle === undefined ? '2 / 2' : '1 / 1',
                  gridColumn: '2 / 2',
                  alignSelf: 'end',
                  justifySelf: 'end'
                }}
              >
                <Tooltip
                  content={
                    database.kind === 'movie'
                      ? _('video_preview.database_link.movie', {
                          defaultValue: 'Open this movie on {database}',
                          database: database.name
                        })
                      : database.kind === 'episode'
                        ? _('video_preview.database_link.episode', {
                            defaultValue: 'Open this episode on {database}',
                            database: database.name
                          })
                        : _('video_preview.database_link.series', {
                            defaultValue: 'Open this series on {database}',
                            database: database.name
                          })
                  }
                  relationship="label"
                  positioning="above-end"
                >
                  <Link href={database.url} target="_blank" rel="noreferrer" style={{ lineHeight: 0 }}>
                    <img
                      src={DATABASE_LOGOS[database.name]?.src}
                      alt={database.name}
                      height={20}
                      style={{ backgroundColor: DATABASE_LOGOS[database.name]?.background, padding: '2px' }}
                    />
                  </Link>
                </Tooltip>
              </div>
            )}
            {secondaryPoster && (
              <div style={{ gridRow: '2 / 2', gridColumn: '2 / 2' }}>
                <Image
                  alt={_('video_preview.no_episode_image', { defaultValue: 'No Episode Image' })}
                  bordered
                  src={secondaryPoster ? 'svp:///' + secondaryPoster : ''}
                  className={'secondary-poster'}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
