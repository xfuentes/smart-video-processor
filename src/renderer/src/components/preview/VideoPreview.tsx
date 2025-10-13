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

import { Image, RatingDisplay, Tooltip } from '@fluentui/react-components'
import { Country } from '../../../../common/Countries'

type Props = {
  poster: string | undefined
  secondaryPoster?: string
  title: string | undefined
  year: number | undefined
  subTitle?: string
  overview?: string | undefined
  altOverview?: string
  countries?: Country[]
  rating?: number
}

export const VideoPreview = ({
  title,
  year,
  poster,
  overview,
  altOverview,
  secondaryPoster,
  subTitle,
  countries,
  rating
}: Props) => {
  return (
    <div className="video-preview">
      {altOverview ? (
        <Tooltip content={altOverview} relationship="description">
          <Image alt="No Poster" bordered src={poster ? 'svp:///' + poster : ''} className="poster" />
        </Tooltip>
      ) : (
        <Image alt="No Poster" bordered src={poster ? 'svp:///' + poster : ''} className="poster" />
      )}
      <div className="vertical-stack" style={{ height: '173px', justifyContent: 'space-between', flexGrow: 1 }}>
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
              <Tooltip content={title + (year ? ` (${year})` : '')} relationship="description">
                <div className="shrinkable-text">
                  {title}
                  {year ? ` (${year})` : ''}
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
                    <Tooltip content={country.label} relationship="description">
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
        {(overview || secondaryPoster) && (
          <div style={{ columnGap: '5px', display: 'grid', flexGrow: 1, gridTemplateRows: '1fr 70px', height: 0 }}>
            <div className="overview">{overview ? overview : ''}</div>
            {secondaryPoster && (
              <div style={{ gridRow: '2 / 2', gridColumn: '2 / 2' }}>
                <Image
                  alt="No Episode Image"
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
