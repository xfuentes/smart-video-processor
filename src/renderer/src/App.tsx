import React, { SyntheticEvent, useEffect, useRef, useState } from 'react'
import './assets/styles/App.css'
import { IVideo } from '../../common/@types/Video'
import { ListChangedListener, VideoChangedListener, VideosChangedListener } from '../../preload/@types'
import { PreviewTabs } from '@renderer/components/preview/PreviewTabs'
import { VideoPlayerProvider } from '@renderer/components/context/VideoPlayerProvider'
import { SettingsProvider } from '@renderer/components/context/SettingsProvider'
import { ListOrVideoContainer } from '@renderer/components/ListOrVideoContainer'
import { MultiPreviewTabs } from '@renderer/components/preview/MultiPreviewTabs'
import { PaneSplitter } from '@renderer/components/PaneSplitter'
import { PREVIEW_PANE_HEIGHT } from '../../common/@types/Settings'

const initialSettings = await window.api.main.getCurrentSettings()
const initialPreviewPaneHeight = initialSettings.result?.previewPaneHeight ?? PREVIEW_PANE_HEIGHT.default
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

  const [videos, setVideos] = useState<IVideo[]>([])
  const [selectedVideos, setSelectedVideos] = useState<IVideo[]>([])
  const [previewPaneHeight, setPreviewPaneHeight] = useState(initialPreviewPaneHeight)
  const controlsAreaRef = useRef<HTMLDivElement>(null)

  // While dragging, the pane is resized directly to avoid re-rendering the previews on every pointer move.
  const applyPreviewPaneHeight = (percent: number) => {
    if (controlsAreaRef.current) {
      controlsAreaRef.current.style.minHeight = `${percent}%`
      controlsAreaRef.current.style.maxHeight = `${percent}%`
    }
  }
  const commitPreviewPaneHeight = (percent: number) => {
    setPreviewPaneHeight(percent)
    void window.api.main.setPreviewPaneHeight(percent)
  }
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
        return selectionChanged ? newSelection : prevSelection
      })
    }
  }

  const videosChangedListener: VideosChangedListener = (changedVideos: IVideo[]) => {
    if (selectedVideosRef.current.length > 0) {
      setSelectedVideos((prevSelection) => {
        let selectionChanged: boolean = false
        const newSelection = prevSelection.map((prevVideo) => {
          const changedVideo = changedVideos.find((v) => v.uuid === prevVideo.uuid)
          if (changedVideo) {
            selectionChanged = true
            return changedVideo
          }
          return prevVideo
        })
        return selectionChanged ? newSelection : prevSelection
      })
    }
  }

  useEffect(() => {
    const removeListChangedListener = window.api.video.addListChangedListener(listChangedListener)
    const removeVideoChangedListener = window.api.video.addVideoChangedListener(videoChangedListener)
    const removeVideosChangedListener = window.api.video.addVideosChangedListener(videosChangedListener)
    return () => {
      removeListChangedListener()
      removeVideoChangedListener()
      removeVideosChangedListener()
    }
  }, [])

  return (
    <SettingsProvider>
      <VideoPlayerProvider>
        <div
          onDrop={preventDefault}
          onDragOver={preventDefault}
          onDragLeave={preventDefault}
          role="application"
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <div className="vertical-stack">
              <ListOrVideoContainer
                videos={videos}
                selectedVideos={selectedVideos}
                onImportVideos={handleImportVideos}
                onSelectionChange={handleSelectionChange}
              ></ListOrVideoContainer>
              {selectedVideos?.length > 0 && selectedVideos.find((sv) => sv.loading) === undefined && (
                <>
                  <PaneSplitter
                    value={previewPaneHeight}
                    onResize={applyPreviewPaneHeight}
                    onCommit={commitPreviewPaneHeight}
                  />
                  <div
                    ref={controlsAreaRef}
                    className="controls-area"
                    style={{
                      minHeight: `${previewPaneHeight}%`,
                      maxHeight: `${previewPaneHeight}%`,
                      boxSizing: 'border-box',
                      borderTop: '1px solid var(--colorNeutralStroke2)'
                    }}
                  >
                    {selectedVideos.length > 1 ? (
                      <MultiPreviewTabs videos={selectedVideos} />
                    ) : (
                      <PreviewTabs video={selectedVideos[0]} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </VideoPlayerProvider>
    </SettingsProvider>
  )
}
