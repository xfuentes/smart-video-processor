/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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
import { LanguageSelector } from './fields/LanguageSelector'
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
import {
  translationSupportedLanguageCodes,
  tvdbSupportedLanguageCodes
} from '../../../common/TranslationSupportedLanguages'
import { ProgressButton } from '@renderer/components/ProgressButton'
import { useSettings } from '@renderer/components/context/SettingsContext'
import i18n, { useI18n } from '../i18n'

export const SettingsDialog = () => {
  const _ = useI18n()

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
      additionalTvSearchLanguages,
      tmpFilesPath,
      moviesOutputPath,
      animatedMoviesOutputPath,
      tvShowsOutputPath,
      animatedTVShowsOutputPath,
      othersOutputPath,
      isAutoStartEnabled,
      priority,
      isDebugEnabled,
      isTrackFilteringEnabled,
      favoriteLanguages,
      isKeepVOEnabled,
      isTrackEncodingEnabled,
      videoCodec,
      videoSizeReduction,
      videoEnforceCodec: videoEnforceCodec,
      audioSizeReduction,
      audioEnforceCodec: audioEnforceCodec,
      mkvMergePath,
      ffmpegPath,
      ffprobePath
    }
    const validation = await window.api.main.saveSettings(newSettings)
    setSettingsValidation(validation)
    await i18n.changeLanguage(language)
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
      setAdditionalTvSearchLanguages(settingsValidation.result.additionalTvSearchLanguages)
      setTmpFilesPath(settingsValidation.result.tmpFilesPath)
      setMoviesOutputPath(settingsValidation.result.moviesOutputPath)
      setAnimatedMoviesOutputPath(settingsValidation.result.animatedMoviesOutputPath)
      setTVShowsOutputPath(settingsValidation.result.tvShowsOutputPath)
      setAnimatedTVShowsOutputPath(settingsValidation.result.animatedTVShowsOutputPath)
      setOthersOutputPath(settingsValidation.result.othersOutputPath)
      setAutoStartEnabled(settingsValidation.result.isAutoStartEnabled)
      setPriority(settingsValidation.result.priority)
      setDebugEnabled(settingsValidation.result.isDebugEnabled)
      setTrackFilteringEnabled(settingsValidation.result.isTrackFilteringEnabled)
      setFavoriteLanguages(settingsValidation.result.favoriteLanguages)
      setKeepVOEnabled(settingsValidation.result.isKeepVOEnabled)
      setTrackEncodingEnabled(settingsValidation.result.isTrackEncodingEnabled)
      setVideoCodec(settingsValidation.result.videoCodec)
      setVideoSizeReduction(settingsValidation.result.videoSizeReduction)
      setVideoEnforceCodec(settingsValidation.result.videoEnforceCodec)
      setAudioSizeReduction(settingsValidation.result.audioSizeReduction)
      setAudioEnforceCodec(settingsValidation.result.audioEnforceCodec)
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
  const [additionalTvSearchLanguages, setAdditionalTvSearchLanguages] = useState(
    settingsValidation?.result?.additionalTvSearchLanguages ?? ['en']
  )
  const [tmpFilesPath, setTmpFilesPath] = useState(settingsValidation?.result?.tmpFilesPath)
  const [moviesOutputPath, setMoviesOutputPath] = useState(settingsValidation?.result?.moviesOutputPath)
  const [animatedMoviesOutputPath, setAnimatedMoviesOutputPath] = useState(
    settingsValidation?.result?.animatedMoviesOutputPath
  )
  const [tvShowsOutputPath, setTVShowsOutputPath] = useState(settingsValidation?.result?.tvShowsOutputPath)
  const [animatedTVShowsOutputPath, setAnimatedTVShowsOutputPath] = useState(
    settingsValidation?.result?.animatedTVShowsOutputPath
  )
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
  const [videoSizeReduction, setVideoSizeReduction] = useState(settingsValidation?.result?.videoSizeReduction)
  const [videoEnforceCodec, setVideoEnforceCodec] = useState(settingsValidation?.result?.videoEnforceCodec)
  const [videoCodec, setVideoCodec] = useState(settingsValidation?.result?.videoCodec)
  const [audioSizeReduction, setAudioSizeReduction] = useState(settingsValidation?.result?.audioSizeReduction)
  const [audioEnforceCodec, setAudioEnforceCodec] = useState(settingsValidation?.result?.audioEnforceCodec)
  const [mkvMergePath, setMkvMergePath] = useState(settingsValidation?.result?.mkvMergePath)
  const [ffmpegPath, setFfmpegPath] = useState(settingsValidation?.result?.ffmpegPath)
  const [ffprobePath, setFfprobePath] = useState(settingsValidation?.result?.ffprobePath)

  return (
    <Dialog modalType="modal" open={opened} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <ToolbarButton vertical icon={<Settings24Regular />}>
          {_('settings.trigger.label', { defaultValue: 'Settings' })}
        </ToolbarButton>
      </DialogTrigger>
      <DialogSurface
        aria-label={_('settings.aria_label', { defaultValue: 'Settings' })}
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
                  {_('settings.tab.general', { defaultValue: 'General' })}
                </Tab>
                <Tab value="output" icon={<ArchiveSettings20Regular />}>
                  {_('settings.tab.output', { defaultValue: 'Output' })}
                </Tab>
                <Tab value="filtering" icon={<SearchSettings20Regular />}>
                  {_('settings.tab.filtering', { defaultValue: 'Filtering' })}
                </Tab>
                <Tab value="encoding" icon={<VideoSettings20Regular />}>
                  {_('settings.tab.encoding', { defaultValue: 'Encoding' })}
                </Tab>
              </TabList>
              <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column' }}>
                {selectedTab === 'general' && (
                  <div className="settings-form">
                    <div className="field">
                      <Label size="small" required htmlFor="languageInput">
                        {_('settings.language.label', { defaultValue: 'Language' })}
                      </Label>
                      <LanguageSelector
                        multiselect={false}
                        size="small"
                        id="languageInput"
                        includeEnglishInLabel
                        required
                        allowedCodes={translationSupportedLanguageCodes}

                        value={language}
                        onChange={(data) => setLanguage(data)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" htmlFor="additionalTvSearchLanguagesInput">
                        {_('settings.additional_languages.label', {
                          defaultValue: 'Additional TV Search Languages'
                        })}
                      </Label>
                      <LanguageSelector
                        multiselect
                        size="small"
                        id="additionalTvSearchLanguagesInput"
                        allowedCodes={tvdbSupportedLanguageCodes}
                        value={additionalTvSearchLanguages}
                        onChanges={(data) => setAdditionalTvSearchLanguages(data)}
                      />
                    </div>
                    <div className="field">
                      <Switch
                        label={_('settings.auto_start.label', { defaultValue: 'Auto Start' })}
                        checked={isAutoStartEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) => setAutoStartEnabled(ev.currentTarget.checked)}
                      />
                    </div>
                    {!window.api.main.isLimitedPermissions && (
                      <div className="field">
                        <Label htmlFor="prioritySlider">
                          {_('settings.priority.label', { defaultValue: 'Processes Priority' })}
                        </Label>
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
                              {_('settings.priority.level.' + priority.toLowerCase(), {
                                defaultValue: ProcessesPriority[priority]
                              })}
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="field">
                      <Switch
                        label={_('settings.debug_mode.label', { defaultValue: 'Debug Mode' })}
                        checked={isDebugEnabled}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) => setDebugEnabled(ev.currentTarget.checked)}
                      />
                    </div>
                  </div>
                )}
                {selectedTab === 'output' && (
                  <div className="settings-form">
                    <div className="field">
                      <Label size="small" required htmlFor="tmpFilesPathInput">
                        {_('settings.tmp_files_path.label', {
                          defaultValue: 'Temporary Files Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
                        type="text"
                        id="tmpFilesPathInput"
                        value={tmpFilesPath}
                        onChange={handleFormInputChange.bind(null, setTmpFilesPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" required htmlFor="moviesOutputPathInput">
                        {_('settings.movies_output_path.label', {
                          defaultValue: 'Movies Output Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
                        type="text"
                        id="moviesOutputPathInput"
                        value={moviesOutputPath}
                        onChange={handleFormInputChange.bind(null, setMoviesOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" required htmlFor="animatedMoviesOutputPathInput">
                        {_('settings.animated_movies_output_path.label', {
                          defaultValue: 'Animated Movies Output Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
                        type="text"
                        id="animatedMoviesOutputPathInput"
                        value={animatedMoviesOutputPath}
                        onChange={handleFormInputChange.bind(null, setAnimatedMoviesOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" required htmlFor="tvShowsOutputPathInput">
                        {_('settings.tv_shows_output_path.label', {
                          defaultValue: 'TV Shows Output Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
                        type="text"
                        id="tvShowsOutputPathInput"
                        value={tvShowsOutputPath}
                        onChange={handleFormInputChange.bind(null, setTVShowsOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" required htmlFor="animatedTVShowsOutputPathInput">
                        {_('settings.animated_tv_shows_output_path.label', {
                          defaultValue: 'Animated TV Shows Output Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
                        type="text"
                        id="animatedTVShowsOutputPathInput"
                        value={animatedTVShowsOutputPath}
                        onChange={handleFormInputChange.bind(null, setAnimatedTVShowsOutputPath)}
                      />
                    </div>
                    <div className="field">
                      <Label size="small" required htmlFor="othersOutputPathInput">
                        {_('settings.others_output_path.label', {
                          defaultValue: 'Others Output Path (Can be relative to source file path)'
                        })}
                      </Label>
                      <Input
                        required
                        size="small"
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
                        label={_('settings.track_filtering.label', { defaultValue: 'Track Filtering' })}
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
                          size="small"
                          required
                          htmlFor="favoriteLanguagesInput"
                        >
                          {_('settings.favorite_languages.label', { defaultValue: 'Favorite Languages' })}
                        </Label>
                        <LanguageSelector
                          disabled={!isTrackFilteringEnabled}
                          multiselect
                          size="small"
                          id="favoriteLanguagesInput"
                          required
                          value={favoriteLanguages}
                          onChanges={(data) => setFavoriteLanguages(data)}
                        />
                      </div>
                      <div className="field">
                        <Switch
                          disabled={!isTrackFilteringEnabled}
                          label={_('settings.keep_vo.label', { defaultValue: 'Keep VO' })}
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
                            {_('settings.track_encoding.label', { defaultValue: 'Track Encoding' })}
                            <InfoLabel
                              info={
                                <div>
                                  {_('settings.track_encoding.info', {
                                    defaultValue:
                                      'If enabled allow automatic track encoding when the given criteria are fulfilled.'
                                  })}
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
                    <>
                      <Divider style={{ flexGrow: '0' }}>
                        {_('settings.encoding.video_divider', { defaultValue: 'Video' })}
                      </Divider>
                      <div className="field">
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 1fr' }}>
                          <Label htmlFor="codecSelection" disabled={!isTrackEncodingEnabled}>
                            {_('settings.encoding.video_codec.label', { defaultValue: 'Codec' })}
                            <InfoLabel
                              info={
                                <div>
                                  {_('settings.encoding.video_codec.info', {
                                    defaultValue:
                                      'Choose your favorite video codec. It will be used by default when video encoding is recommended. Auto will select the most appropriate codec depending on the video resolution.'
                                  })}
                                </div>
                              }
                            />
                          </Label>
                          <Select
                            size="small"
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
                            {_('settings.encoding.size_reduction', { defaultValue: 'Size Reduction' })}
                            <InfoLabel
                              info={
                                <div>
                                  {_('settings.encoding.video_size_reduction.info', {
                                    defaultValue:
                                      'Choose the minimum size reduction ratio required to enable re-encoding a video track.'
                                  })}
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
                      <div className="field">
                        <Switch
                          disabled={!isTrackEncodingEnabled}
                          label={
                            <div>
                              {_('settings.encoding.re_encode_on_mismatch', {
                                defaultValue: 'Re-encode on Codec Mismatch'
                              })}
                              <InfoLabel
                                info={
                                  <div>
                                    {_('settings.encoding.video_re_encode_on_mismatch.info', {
                                      defaultValue:
                                        'If enabled, re-encodes video stream when the codec is not H.264 or H.265.'
                                    })}
                                  </div>
                                }
                              />
                            </div>
                          }
                          checked={videoEnforceCodec}
                          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                            setVideoEnforceCodec(ev.currentTarget.checked ?? false)
                          }
                        />
                      </div>
                      <Divider style={{ flexGrow: '0' }}>
                        {_('settings.encoding.audio_divider', { defaultValue: 'Audio' })}
                      </Divider>
                      <div className="field">
                        <div style={{ display: 'grid', gridTemplateColumns: '200px 2fr 1fr' }}>
                          <Label htmlFor="audioSizeReductionSlider" disabled={!isTrackEncodingEnabled}>
                            {_('settings.encoding.size_reduction', { defaultValue: 'Size Reduction' })}
                            <InfoLabel
                              info={
                                <div>
                                  {_('settings.encoding.audio_size_reduction.info', {
                                    defaultValue:
                                      'Choose the minimum size reduction ratio required to enable re-encoding an audio track.'
                                  })}
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
                      <div className="field">
                        <Switch
                          disabled={!isTrackEncodingEnabled}
                          label={
                            <div>
                              {_('settings.encoding.re_encode_on_mismatch', {
                                defaultValue: 'Re-encode on Codec Mismatch'
                              })}
                              <InfoLabel
                                info={
                                  <div>
                                    {_('settings.encoding.audio_re_encode_on_mismatch.info', {
                                      defaultValue: 'If enabled, re-encodes audio stream when the codec is not AAC.'
                                    })}
                                  </div>
                                }
                              />
                            </div>
                          }
                          checked={audioEnforceCodec}
                          onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                            setAudioEnforceCodec(ev.currentTarget.checked ?? false)
                          }
                        />
                      </div>
                    </>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions style={{ paddingTop: '10px' }}>
              <DialogTrigger disableButtonEnhancement>
                <ProgressButton appearance="primary" execute={handleSubmit}>
                  {_('settings.apply.label', { defaultValue: 'Apply' })}
                </ProgressButton>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button size="small" appearance="secondary" onClick={handleCancel}>
                  {_('settings.cancel.label', { defaultValue: 'Cancel' })}
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}
