import React, { SyntheticEvent, useEffect, useState } from 'react'
import { Divider } from '@fluentui/react-components'
import { MainToolbar } from '@renderer/components/MainToolbar'
import { SettingsContext } from '@renderer/components/SettingsContext'
import './assets/styles/App.css'
import { IVideo } from '../../common/@types/Video'
import { FilesChangedListener } from '../../preload/@types'
import { VideoList } from '@renderer/components/VideoList'

const initialSettings = await window.api.main.getCurrentSettings()

export const App = (): React.JSX.Element => {
  const preventDefault = (e: SyntheticEvent) => {
    e.preventDefault()
  }
  const handleSelectionChange = (videos: IVideo[] | undefined) => {
    setSelectedVideos(videos)
  }
  const handleImportVideos = (files: File[]) => {
    if (files.length > 0) {
      void window.api.video.openFiles(files)
    }
  }

  const [settings, setSettings] = useState(initialSettings)
  const [videos, setVideos] = React.useState<IVideo[]>([])
  const [selectedVideos, setSelectedVideos] = React.useState<IVideo[] | undefined>([])

  useEffect(() => {
    const listener: FilesChangedListener = (videos: IVideo[]) => {
      console.log('*** Received Video Update ***')
      console.log(videos)
      setVideos(videos)
    }

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
              <MainToolbar onOpen={() => window.api.video.openFileExplorer()} selectedVideos={selectedVideos} />
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
          </div>
        </div>
      </div>
    </SettingsContext.Provider>
  )
}
