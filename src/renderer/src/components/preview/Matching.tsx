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

import Video, {SearchBy, VideoType} from "../../common/Video.ts";
import {Button, Field, Input, MessageBar, MessageBarGroup, Select} from "@fluentui/react-components";
import {Search16Regular} from "@fluentui/react-icons";
import {useState} from "react";
import {SearchResult} from "../../common/SearchResult.ts";
import {SearchResultList} from "./SearchResults.tsx";
import {VideoPreview} from "./VideoPreview.tsx";
import {EpisodeOrder} from "../../common/clients/TVDBClient.ts";
import {EditionType} from "../../common/Movie.ts";

type Props = {
    video: Video
};

export const Matching = ({video}: Props) => {
    const [searchError, setSearchError] = useState<string | undefined>(undefined);

    return <>
        <div className="matching-form">
            <div>
                <Field size="small" label="Type">
                    <Select value={video.type}
                        onChange={(_ev, data) => {
                            video.setType(data.value as VideoType);
                            video.setSearchBy(SearchBy.TITLE);
                        }}>
                        {Object.values(VideoType).filter(t => t !== VideoType.OTHER)
                            .map(key => (<option key={key}>{key}</option>))}
                    </Select>
                </Field>
            </div>
            {video.type === VideoType.MOVIE &&
              <>
                <div>
                  <Field size="small" label="Search By">
                    <Select value={video.searchBy}
                      onChange={(_ev, data) => {
                          video.setSearchBy(data.value as SearchBy)
                      }}>
                      <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                      <option key={SearchBy.IMDB}>{SearchBy.IMDB}</option>
                      <option key={SearchBy.TMDB}>{SearchBy.TMDB}</option>
                    </Select>
                  </Field>
                </div>
                  {video.searchBy === SearchBy.TITLE &&
                    <>
                      <div className="growing-form-field">
                        <Field size="small" label="Title" required>
                          <Input value={video.movie.title || ""}
                            onChange={(_ev, data) => video.movie.setTitle(data.value)}/>
                        </Field>
                      </div>
                      <div>
                        <Field size="small" label="Year">
                          <Input type="number" value={video.movie.year ? "" + video.movie.year : ""} style={{minWidth: 1, maxWidth: 72}}
                            onChange={(_ev, data) => video.movie.setYear(data.value)}/>
                        </Field>
                      </div>
                    </>}
                  {video.searchBy === SearchBy.IMDB &&
                    <div>
                      <Field size="small" label="IMDB ID" required>
                        <Input value={video.movie.imdb || ""}
                          onChange={(_ev, data) => video.movie.setIMDB(data.value)}/>
                      </Field>
                    </div>}
                  {video.searchBy === SearchBy.TMDB &&
                    <div>
                      <Field size="small" label="TMDB ID" required>
                        <Input value={video.movie.tmdb ? "" + video.movie.tmdb : ""} type="number"
                          onChange={(_ev, data) => video.movie.setTMDB(data.value)}/>
                      </Field>
                    </div>}
                <Field size="small" label="Edition">
                  <Select value={video.movie.edition}
                    onChange={(_ev, data) => {
                        video.movie.setEdition(data.value as EditionType);
                    }}>
                      {Object.values(EditionType)
                          .map(key => <option key={key} value={key}>{key}</option>)
                      }
                  </Select>
                </Field>
              </>
            }
            {video.type === VideoType.TV_SHOW &&
              <>
                <div>
                  <Field size="small" label="Search By">
                    <Select value={video.searchBy}
                      onChange={(_ev, data) => {
                          video.setSearchBy(data.value as SearchBy)
                      }}>
                      <option key={SearchBy.TITLE}>{SearchBy.TITLE}</option>
                      <option key={SearchBy.TVDB}>{SearchBy.TVDB}</option>
                    </Select>
                  </Field>
                </div>
                  {video.searchBy === SearchBy.TITLE &&
                    <>
                      <div>
                        <Field size="small" label="Title" required>
                          <Input value={video.tvShow.title || ""}
                            onChange={(_ev, data) => video.tvShow.setTitle(data.value)}/>
                        </Field>
                      </div>
                      <div>
                        <Field size="small" label="Year">
                          <Input type="number" value={video.tvShow.year ? "" + video.tvShow.year : ""} style={{minWidth: 1}}
                            onChange={(_ev, data) => video.tvShow.setYear(data.value)}/>
                        </Field>
                      </div>
                    </>
                  }
                  {video.searchBy === SearchBy.TVDB &&
                    <>
                      <div>
                        <Field size="small" label="TVDB ID" required>
                          <Input value={video.tvShow.theTVDB ? "" + video.tvShow.theTVDB : ""}
                            onChange={(_ev, data) => video.tvShow.setTheTVDB(data.value)}/>
                        </Field>
                      </div>
                    </>
                  }
                <div>
                  <Field size="small" label="Order">
                    <Select value={video.tvShow.order}
                      onChange={(_ev, data) => video.tvShow.setOrder(data.value as EpisodeOrder)}>
                      <option value="official">Official</option>
                      <option value="dvd">DVD</option>
                      <option value="absolute">Absolute</option>
                    </Select>
                  </Field>
                </div>
                  {video.tvShow.order !== "absolute" ?
                      <>
                          <div>
                              <Field size="small" label="Season" required>
                                  <Input type="number" value={!video.tvShow.season ? "" : "" + video.tvShow.season} style={{minWidth: 1}}
                                      onChange={(_ev, data) => video.tvShow.setSeason(data.value)}/>
                              </Field>
                          </div>
                          <div>
                              <Field size="small" label="Episode" required>
                                  <Input type="number" value={!video.tvShow.episode ? "" : "" + video.tvShow.episode} style={{minWidth: 1}}
                                      onChange={(_ev, data) => video.tvShow.setEpisode(data.value)}/>
                              </Field>
                          </div>
                      </> :
                      <div>
                          <Field size="small" label="Episode" required>
                              <Input type="number" value={!video.tvShow.absoluteEpisode ? "" : "" + video.tvShow.absoluteEpisode} style={{minWidth: 1}}
                                  onChange={(_ev, data) => video.tvShow.setAbsoluteEpisode(data.value)}/>
                          </Field>
                      </div>
                  }
              </>
            }
            {video.type !== VideoType.OTHER &&
              <div className="buttons">
                <Button size={"small"} icon={<Search16Regular/>}
                  onClick={() => void video.search()
                      .then(() => setSearchError(undefined))
                      .catch(error => setSearchError((error as Error).message))}
                >Search</Button>
              </div>
            }
        </div>
        {searchError !== undefined ?
            <MessageBarGroup>
                <MessageBar shape="rounded" intent={"error"}>{searchError}</MessageBar>
            </MessageBarGroup> :
            <div className={"matching-results"}>
                <SearchResultList results={video.getSearchResults()}
                    onSelectionChange={(selection: SearchResult | undefined) => void video.selectSearchResultID(selection?.id)
                        .then(() => setSearchError(undefined))
                        .catch(error => setSearchError((error as Error).message))}
                    selectedID={video.getSelectedSearchResultID()}/>
                <div className="preview-space">
                    {video.type === VideoType.MOVIE &&
                      <VideoPreview
                        title={video.movie.title}
                        poster={video.movie.poster}
                        overview={video.movie.overview}
                        countries={video.movie.originalCountries}
                        year={video.movie.year}
                        rating={video.movie.rating}
                      />
                    }
                    {video.type === VideoType.TV_SHOW &&
                      <VideoPreview
                        title={video.tvShow.title}
                        subTitle={video.tvShow.episodeTitle}
                        poster={video.tvShow.poster}
                        overview={video.tvShow.episodeOverview ?? video.tvShow.overview}
                        altOverview={video.tvShow.episodeOverview !== undefined ? video.tvShow.overview : undefined}
                        year={video.tvShow.year}
                        countries={video.tvShow.originalCountries}
                        secondaryPoster={video.tvShow.episodePoster}/>
                    }
                </div>
            </div>
        }
    </>;
}
