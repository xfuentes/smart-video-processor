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

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTrigger,
  Divider,
  InfoLabel,
  Input,
  InputOnChangeData,
  Label,
  Link,
  Select,
  SelectTabData,
  SelectTabEvent,
  Slider,
  Switch,
  Tab,
  TabList,
  ToolbarButton
} from '@fluentui/react-components'
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { LanguageSelector } from './LanguageSelector'
import {
  ArchiveSettings20Regular,
  DocumentSettings20Regular,
  SearchSettings20Regular,
  Settings24Regular,
  VideoSettings20Regular
} from '@fluentui/react-icons'
import { Settings } from '../../../common/@types/Settings'
import { ProcessesPriority } from '../../../common/@types/processes'
import { VideoCodec } from '../../../common/@types/Encoding'
import { FileSelectorField } from '@renderer/components/fields/FileSelectorField'
import { ProgressButton } from '@renderer/components/ProgressButton'
import { useSettings } from '@renderer/components/context/SettingsContext'

export const SettingsDialog = () => {
  const { settingsValidation, setSettingsValidation } = useSettings()
  const [selectedTab, setSelectedTab] = useState('general')
  const [opened, setOpened] = useState(settingsValidation.status !== 'success')

  const handleOpenChange = (_event, data) => {
    setOpened(data.open)
  }

  const handleSubmit = async () => {
    const newSettings: Settings = {
      ...settingsValidation.result,
      language,
      tmpFilesPath,
      moviesOutputPath,
      tvShowsOutputPath,
      othersOutputPath,
      isAutoStartEnabled,
      priority,
      isDebugEnabled,
      isTrackFilteringEnabled,
      favoriteLanguages,
      isKeepVOEnabled,
      isTrackEncodingEnabled,
      videoCodec,
      isFineTrimEnabled,
      videoSizeReduction,
      audioSizeReduction,
      mkvMergePath,
      ffmpegPath,
      ffprobePath
    }
    const validation = await window.api.main.saveSettings(newSettings)
    setSettingsValidation(validation)
    if (validation.status != 'success') {
      throw new Error('Validation error')
    }
  }

  const handleFormInputChange = (
    setData: Dispatch<SetStateAction<string>>,
    _ev: ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ) => {
    setData(data.value)
  }

  const handleCancel = (_ev: React.FormEvent) => {
    if (settingsValidation.result) {
      setLanguage(settingsValidation.result.language)
      setTmpFilesPath(settingsValidation.result.tmpFilesPath)
      setMoviesOutputPath(settingsValidation.result.moviesOutputPath)
      setTVShowsOutputPath(settingsValidation.result.tvShowsOutputPath)
      setOthersOutputPath(settingsValidation.result.othersOutputPath)
      setAutoStartEnabled(settingsValidation.result.isAutoStartEnabled)
      setPriority(settingsValidation.result.priority)
      setDebugEnabled(settingsValidation.result.isDebugEnabled)
      setTrackFilteringEnabled(settingsValidation.result.isTrackFilteringEnabled)
      setFavoriteLanguages(settingsValidation.result.favoriteLanguages)
      setKeepVOEnabled(settingsValidation.result.isKeepVOEnabled)
      setTrackEncodingEnabled(settingsValidation.result.isTrackEncodingEnabled)
      setIsFineTrimEnabled(settingsValidation.result.isFineTrimEnabled)
      setVideoCodec(settingsValidation.result.videoCodec)
      setVideoSizeReduction(settingsValidation.result.videoSizeReduction)
      setAudioSizeReduction(settingsValidation.result.audioSizeReduction)
      setMkvMergePath(settingsValidation.result.mkvMergePath)
      setFfmpegPath(settingsValidation.result.ffmpegPath)
      setFfprobePath(settingsValidation.result.ffprobePath)
    }
    setOpened(false)
  }

  const priorityToNumber = (priority: keyof typeof ProcessesPriority): number => {
    switch (priority) {
      case 'HIGH':
        return 2
      case 'ABOVE_NORMAL':
        return 1
      case 'NORMAL':
        return 0
      case 'BELOW_NORMAL':
        return -1
      case 'LOW':
        return -2
      default:
        return 0
    }
  }

  const numberToPriority = (priority: number): keyof typeof ProcessesPriority => {
    switch (priority) {
      case 2:
        return 'HIGH'
      case 1:
        return 'ABOVE_NORMAL'
      case 0:
        return 'NORMAL'
      case -1:
        return 'BELOW_NORMAL'
      case -2:
        return 'LOW'
      default:
        return 'NORMAL'
    }
  }

  const [language, setLanguage] = useState(settingsValidation?.result?.language)
  const [tmpFilesPath, setTmpFilesPath] = useState(settingsValidation?.result?.tmpFilesPath)
  const [moviesOutputPath, setMoviesOutputPath] = useState(settingsValidation?.result?.moviesOutputPath)
  const [tvShowsOutputPath, setTVShowsOutputPath] = useState(settingsValidation?.result?.tvShowsOutputPath)
  const [othersOutputPath, setOthersOutputPath] = useState(settingsValidation?.result?.othersOutputPath)
  const [isAutoStartEnabled, setAutoStartEnabled] = useState(settingsValidation?.result?.isAutoStartEnabled)
  const [priority, setPriority] = useState(settingsValidation?.result?.priority)
  const priorityClass = 'priority-' + priority?.toLowerCase()
  const [isDebugEnabled, setDebugEnabled] = useState(settingsValidation?.result?.isDebugEnabled)
  const [isTrackFilteringEnabled, setTrackFilteringEnabled] = useState(
    settingsValidation?.result?.isTrackFilteringEnabled
  )
  const [favoriteLanguages, setFavoriteLanguages] = useState(settingsValidation?.result?.favoriteLanguages)
  const [isKeepVOEnabled, setKeepVOEnabled] = useState(settingsValidation?.result?.isKeepVOEnabled)
  const [isTrackEncodingEnabled, setTrackEncodingEnabled] = useState(settingsValidation?.result?.isTrackEncodingEnabled)
  const [isFineTrimEnabled, setIsFineTrimEnabled] = useState(settingsValidation?.result?.isFineTrimEnabled)
  const [videoSizeReduction, setVideoSizeReduction] = useState(settingsValidation?.result?.videoSizeReduction)
  const [videoCodec, setVideoCodec] = useState(settingsValidation?.result?.videoCodec)
  const [audioSizeReduction, setAudioSizeReduction] = useState(settingsValidation?.result?.audioSizeReduction)
  const [mkvMergePath, setMkvMergePath] = useState(settingsValidation?.result?.mkvMergePath)
  const [ffmpegPath, setFfmpegPath] = useState(settingsValidation?.result?.ffmpegPath)
  const [ffprobePath, setFfprobePath] = useState(settingsValidation?.result?.ffprobePath)

  return (
    <Dialog modalType="modal" open={opened} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <ToolbarButton vertical icon={<Settings24Regular />}>
          Settings
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface
        aria-label="Settings"
        style={{ padding: '5px', minHeight: '500px', display: 'flex', flexFlow: 'column' }}
      >
        <form
          style={{
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexFlow: 'column',
            padding: '5px'
          }}
        >
          <DialogBody style={{ gap: 0, flexGrow: 1 }}>
            <DialogContent className="settings-dialog">
              <TabList
                selectedValue={selectedTab}
                size="small"
                onTabSelect={(_event: SelectTabEvent, data: SelectTabData) => setSelectedTab(data.value as string)}
              >
                <Tab value="general" icon={<DocumentSettings20Regular />}>
                  General
                </Tab>
                <Tab value="output" icon={<ArchiveSettings20Regular />}>
                  Output
                </Tab>
                <Tab value="filtering" icon={<SearchSettings20Regular />}>
                  Filtering
                </Tab>
                <Tab value="encoding" icon={<VideoSettings20Regular />}>
                  Encoding
                </Tab>
              </TabList>
              <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column' }}>
                {selectedTab === 'general' && (
                  <div className="settings-form">
                    <div className="field">
                      <Label size={'small'} required htmlFor="languageInput">
                        Language
                      </Label>
                      <LanguageSelector
                        multiselect={false}
                        size={'small'}
                        id="languageInput"
                        required
                        value={language}
                        onChange={(data) => setLanguage(data)}
                      />
                    </div>
                    {!window.api.main.isLimitedPermissions && (
                      <>
                        <FileSelectorField
                          label={
                            <>
                              MKVMerge Path
                              <InfoLabel
                                info={
                                  <div>
                                    MKVMerge is a command line program which is part of the&nbsp;
                                    <Link onClick={() => window.open('https://mkvtoolnix.org/', '_blank')}>
                                      MKVToolNix suite
                                    </Link>
                                    . MKVToolNix is a powerful tool for editing, merging, and splitting MKV files.
                                  </div>
                                }
                              />
                            </>
                          }
                          required
                          size={'small'}
                          value={mkvMergePath}
                          onChange={(newFile) => setMkvMergePath(newFile)}
                          validationState={settingsValidation?.fields['mkvMergePath']?.status}
                          validationMessage={settingsValidation?.fields['mkvMergePath']?.message}
                        ></FileSelectorField>
                        <FileSelectorField
                          label={
                            <>
                              FFmpeg Path
                              <InfoLabel
                                info={
                                  <div>
                                    <Link onClick={() => window.open('https://www.ffmpeg.org/', '_blank')}>FFmpeg</Link>{' '}
                                    is a complete, cross-platform solution to record, convert and stream audio and
                                    video. make sure to have it installed with x264 and x265 codecs.
                                  </div>
                                }
                              />
                            </>
                          }
                          required
                          size={'small'}
                          value={ffmpegPath}
                          onChange={(newFile) => setFfmpegPath(newFile)}
                          validationState={settingsValidation?.fields['ffmpegPath']?.status}
                          validationMessage={settingsValidation?.fields['ffmpegPath']?.message}
                        />
                        <FileSelectorField
                          label={
                            <>
                              FFprobe Path
                              <InfoLabel
                                info={
                                  <div>
                                    FFprobe is a command line program which is distributed with&nbsp;
                                    <Link onClick={() => window.open('https://www.ffmpeg.org/', '_blank')}>FFmpeg</Link>
                                    .
                                  </div>
                                }
                              />
                            </>
                          }
                          required
                          size={'small'}
                          value={ffprobePath}
                          onChange={(newFile) => setFfprobePath(newFile)}
                          validationState={settingsValidation?.fields['ffmpegPath']?.status}
                          validationMessage={settingsValidation?.fields['ffmpegPath']?.message}
                        />
                      </>
                    )}
                    <div className="field">
                      <Switch
                        label="Auto Start"
                        checked={isAutoStartEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) => setAutoStartEnabled(ev.currentTarget.checked)}
                      />
                    </div>
                    {!window.api.main.isLimitedPermissions && (
                      <div className="field">
                        <Label htmlFor="prioritySlider">Processes Priority</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <Slider
                            min={-2}
                            max={2}
                            value={priorityToNumber(priority)}
                            step={1}
                            size="small"
                            className={priorityClass}
                            onChange={(_ev, data) => setPriority(numberToPriority(data.value))}
                            id="prioritySlider"
                          />
                          <div>
                            <Label className={priorityClass} htmlFor="prioritySlider">
                              {ProcessesPriority[priority]}
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="field">
                      <Switch
                        label="Debug Mode"
                        checked={isDebugEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) => setDebugEnabled(ev.currentTarget.checked)}
                      />
                    </div>
                  </div>
                )}
                {selectedTab === 'output' && (
                  <div className="settings-form">
                    <div className="field">
                      <Label size={'small'} required htmlFor="tmpFilesPathInput">
                        Temporary Files Path (Can be relative to source file path)
                      </Label>
                      <Input
                        required
                        size={'small'}
                        type="text"
                        id="tmpFilesPathInput"
                        value={tmpFilesPath}
                        onChange={handleFormInputChange.bind(null, setTmpFilesPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size={'small'} required htmlFor="moviesOutputPathInput">
                        Movies Output Path (Can be relative to source file path)
                      </Label>
                      <Input
                        required
                        size={'small'}
                        type="text"
                        id="moviesOutputPathInput"
                        value={moviesOutputPath}
                        onChange={handleFormInputChange.bind(null, setMoviesOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size={'small'} required htmlFor="tvShowsOutputPathInput">
                        TV Shows Output Path (Can be relative to source file path)
                      </Label>
                      <Input
                        required
                        size={'small'}
                        type="text"
                        id="tvShowsOutputPathInput"
                        value={tvShowsOutputPath}
                        onChange={handleFormInputChange.bind(null, setTVShowsOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size={'small'} required htmlFor="othersOutputPathInput">
                        Others Output Path (Can be relative to source file path)
                      </Label>
                      <Input
                        required
                        size={'small'}
                        type="text"
                        id="othersOutputPathInput"
                        value={othersOutputPath}
                        onChange={handleFormInputChange.bind(null, setOthersOutputPath)}
                      />
                    </div>
                  </div>
                )}
                {selectedTab === 'filtering' && (
                  <div className="settings-form">
                    <div className="field">
                      <Switch
                        label="Track Filtering"
                        checked={isTrackFilteringEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                          setTrackFilteringEnabled(ev.currentTarget.checked)
                        }
                      />
                    </div>
                    <>
                      <div className="field">
                        <Label
                          disabled={!isTrackFilteringEnabled}
                          size={'small'}
                          required
                          htmlFor="favoriteLanguagesInput"
                        >
                          Favorite Languages
                        </Label>
                        <LanguageSelector
                          disabled={!isTrackFilteringEnabled}
                          multiselect
                          size={'small'}
                          id="favoriteLanguagesInput"
                          required
                          values={favoriteLanguages}
                          onChanges={(data) => setFavoriteLanguages(data)}
                        />
                      </div>
                      <div className="field">
                        <Switch
                          disabled={!isTrackFilteringEnabled}
                          label="Keep VO"
                          checked={isKeepVOEnabled}
                          onChange={(ev: ChangeEvent<HTMLInputElement>) => setKeepVOEnabled(ev.currentTarget.checked)}
                        />
                      </div>
                    </>
                  </div>
                )}
                {selectedTab === 'encoding' && (
                  <div className="settings-form">
                    <div className="field">
                      <Switch
                        label={
                          <div>
                            Track Encoding
                            <InfoLabel
                              info={
                                <div>
                                  If enabled allow automatic track encoding when the given criteria are fulfilled.
                                </div>
                              }
                            />
                          </div>
                        }
                        checked={isTrackEncodingEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                          setTrackEncodingEnabled(ev.currentTarget.checked)
                        }
                      />
                    </div>
                    <div className="field">
                      <Switch
                        disabled={!isTrackEncodingEnabled || true}
                        label={
                          <div>
                            Fine trimming
                            <InfoLabel
                              info={
                                <div>
                                  If enabled, re-encodes all streams for frame-accurate trimming instead of cutting at
                                  keyframes.
                                </div>
                              }
                            />
                          </div>
                        }
                        checked={isFineTrimEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                          setIsFineTrimEnabled(ev.currentTarget.checked && false)
                        }
                      />
                    </div>
                    <>
                      <Divider style={{ flexGrow: '0' }}>Video</Divider>
                      <div className="field">
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 1fr' }}>
                          <Label htmlFor="codecSelection" disabled={!isTrackEncodingEnabled}>
                            Codec
                            <InfoLabel
                              info={
                                <div>
                                  Choose your favorite video codec. It will be used by default when video encoding is
                                  recommended. Auto will select the most appropriate codec depending on the video
                                  resolution.
                                </div>
                              }
                            />
                          </Label>
                          <Select
                            id="codecSelection"
                            value={videoCodec}
                            disabled={!isTrackEncodingEnabled}
                            onChange={(_ev, data) => {
                              setVideoCodec(data.value as VideoCodec)
                            }}
                          >
                            {Object.values(VideoCodec).map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className="field">
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 1fr' }}>
                          <Label htmlFor="videoSizeReductionSlider" disabled={!isTrackEncodingEnabled}>
                            Size Reduction
                            <InfoLabel
                              info={
                                <div>
                                  Choose the minimum size reduction ratio required to enable re-encoding a video track.
                                </div>
                              }
                            />
                          </Label>
                          <Slider
                            min={10}
                            max={90}
                            value={videoSizeReduction}
                            step={10}
                            size="small"
                            disabled={!isTrackEncodingEnabled}
                            onChange={(_ev, data) => setVideoSizeReduction(data.value)}
                            id="videoSizeReductionSlider"
                          />
                          <div>
                            <Label htmlFor="videoSizeReductionSlider">{videoSizeReduction + ' %'}</Label>
                          </div>
                        </div>
                      </div>
                      <Divider style={{ flexGrow: '0' }}>Audio</Divider>
                      <div className="field">
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 1fr' }}>
                          <Label htmlFor="audioSizeReductionSlider" disabled={!isTrackEncodingEnabled}>
                            Size Reduction
                            <InfoLabel
                              info={
                                <div>
                                  Choose the minimum size reduction ratio required to enable re-encoding an audio track.
                                </div>
                              }
                            />
                          </Label>
                          <Slider
                            min={10}
                            max={90}
                            value={audioSizeReduction}
                            step={10}
                            size="small"
                            disabled={!isTrackEncodingEnabled}
                            onChange={(_ev, data) => setAudioSizeReduction(data.value)}
                            id="audioSizeReductionSlider"
                          />
                          <div>
                            <Label htmlFor="audioSizeReductionSlider">{audioSizeReduction + ' %'}</Label>
                          </div>
                        </div>
                      </div>
                    </>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions style={{ paddingTop: '10px' }}>
              <DialogTrigger disableButtonEnhancement>
                <ProgressButton appearance="primary" execute={handleSubmit}>
                  Apply
                </ProgressButton>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}
