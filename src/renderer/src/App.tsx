import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Divider } from '@fluentui/react-components'
import { MainToolbar } from '@renderer/components/MainToolbar'
import { SettingsContext } from '@renderer/components/SettingsContext'
import './assets/styles/App.css'
import { IVideo } from '../../common/@types/Video'
import { ListChangedListener, VideoChangedListener } from '../../preload/@types'
import { VideoList } from '@renderer/components/VideoList'
import { PreviewTabs } from '@renderer/components/preview/PreviewTabs'

const validation = await window.api.main.getCurrentSettings()

export const App = (): React.JSX.Element => {
  const preventDefault = (e: SyntheticEvent) => {
    e.preventDefault()
  }
  const handleSelectionChange = (videos: IVideo[]) => {
    setSelectedVideos(videos)
  }
  const handleImportVideos = (files: File[]) => {
    if (files.length > 0) {
      void window.api.video.openFiles(files)
    }
  }

  const [settingsValidation, setSettingsValidation] = useState(validation)
  const [videos, setVideos] = useState<IVideo[]>([])
  const [selectedVideos, setSelectedVideos] = useState<IVideo[]>([])
  const selectedVideosRef = useRef(selectedVideos)

  useEffect(() => {
    selectedVideosRef.current = selectedVideos
  }, [selectedVideos])

  const listChangedListener: ListChangedListener = (videos: IVideo[]) => {
    setVideos(videos)
    if (selectedVideosRef.current.length > 0) {
      setSelectedVideos((prevSelection) => {
        const newSelection = prevSelection
          ?.map((sv) => videos.find((v) => v.uuid === sv.uuid))
          .filter((sv) => sv !== undefined)
        let selectionChanged = prevSelection.length !== newSelection?.length
        if (!selectionChanged) {
          prevSelection.forEach((value, index) => {
            if (value.uuid !== newSelection[index].uuid) {
              selectionChanged = true
            }
          })
        }
        selectionChanged && console.log('Selection changed!')
        return selectionChanged ? newSelection : prevSelection
      })
    }
  }

  const videoChangedListener: VideoChangedListener = (video: IVideo) => {
    if (selectedVideosRef.current.length > 0) {
      setSelectedVideos((prevSelection) => {
        let selectionChanged: boolean = false
        const newSelection = prevSelection.map((prevVideo) => {
          if (prevVideo.uuid === video.uuid) {
            selectionChanged = true
            return video
          }
          return prevVideo
        })
        selectionChanged && console.log('Selection changed!')
        return selectionChanged ? newSelection : prevSelection
      })
    }
  }

  useEffect(() => {
    const removeListChangedListener = window.api.video.addListChangedListener(listChangedListener)
    const removeVideoChangedListener = window.api.video.addVideoChangedListener(videoChangedListener)
    return () => {
      removeListChangedListener()
      removeVideoChangedListener()
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ settingsValidation, setSettingsValidation }}>
      <div
        onDrop={preventDefault}
        onDragOver={preventDefault}
        onDragLeave={preventDefault}
        role="application"
        style={{ overflow: 'hidden' }}
      >
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <div className="vertical-stack">
            <div style={{ backgroundColor: '#f7f8fa' }}>
              <MainToolbar
                onOpen={() => window.api.video.openFileExplorer()}
                videos={videos}
                selectedVideos={selectedVideos}
              />
            </div>
            <Divider />
            <div className="stack-item-grow">
              <div style={{ height: '100%' }}>
                <VideoList
                  videos={videos}
                  onSelectionChange={handleSelectionChange}
                  onImportVideos={handleImportVideos}
                />
              </div>
            </div>
            {selectedVideos?.length === 1 && !selectedVideos[0].loading && (
              <div className="stack-item-scrollable" style={{ backgroundColor: '#f7f8fa' }}>
                <Divider />
                <PreviewTabs video={selectedVideos[0]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsContext.Provider>
  )
}
