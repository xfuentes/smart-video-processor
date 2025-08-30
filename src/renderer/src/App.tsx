import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { Divider } from '@fluentui/react-components'
import { MainToolbar } from '@renderer/components/MainToolbar'
import { SettingsContext } from '@renderer/components/SettingsContext'
import './assets/styles/App.css'
import { IVideo } from '../../common/@types/Video'
import { FilesChangedListener } from '../../preload/@types'
import { VideoList } from '@renderer/components/VideoList'
import { PreviewTabs } from '@renderer/components/preview/PreviewTabs'

const initialSettings = await window.api.main.getCurrentSettings()

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

  const [settings, setSettings] = useState(initialSettings)
  const [videos, setVideos] = useState<IVideo[]>([])
  const [selectedVideos, setSelectedVideos] = useState<IVideo[]>([])
  const selectedVideosRef = useRef(selectedVideos)

  useEffect(() => {
    selectedVideosRef.current = selectedVideos
  }, [selectedVideos])

  const listener: FilesChangedListener = (videos: IVideo[]) => {
    console.log('*** Received Video Update ***')
    console.log(videos)
    setVideos(videos)
    if (selectedVideosRef.current.length > 0) {
      setSelectedVideos((prevSelectedVideos) =>
        prevSelectedVideos?.map((sv) => videos.find((v) => v.uuid === sv.uuid)).filter((sv) => sv !== undefined)
      )
    }
  }

  useEffect(() => {
    void window.api.video.addFilesChangedListener(listener)

    return () => {
      void window.api.video.removeFilesChangedListener(listener)
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
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
