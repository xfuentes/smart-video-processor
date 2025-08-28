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

import Video from "../../common/Video.ts";
import {Button, Checkbox, Divider, Field, InfoLabel, ProgressBar} from "@fluentui/react-components";
import {WrenchSettings20Regular} from "@fluentui/react-icons";
import {useEffect, useRef, useState} from "react";
import Track, {TrackType} from "../../common/Track.ts";
import Strings from "../../util/strings.ts";
import {JobStatus} from "../../common/jobs/Job.ts";

type Props = {
    video: Video
};

const trackTypeEncodingSection = (video: Video, type: TrackType, expand: boolean = false) => {
    const selectedTrackIds = video.getSelectedTracks().map(t => t.id);
    const filteredTracks = video.tracks.filter(t => t.type === type).filter(s => selectedTrackIds.includes(s.id));
    return filteredTracks.length > 0 &&
      <>
        <Divider style={{flexGrow: "0"}}>{type} Options</Divider>
        <div className="encoding-form" style={(expand ? {flexGrow: 1} : {})}>
            {filteredTracks.map((track: Track) => {
                const key = track.type + " " + track.id;
                const es = video.encoderSettings.find(s => s.trackId === track.id);
                let infoLabel = undefined;
                let disabled = false;
                if (track.unsupported) {
                    infoLabel = <InfoLabel info={<div>Conversion to a supported audio format is mandatory.</div>}/>;
                    disabled = true;
                } else if (es && es.targetSize) {
                    infoLabel = <InfoLabel info={<div style={{whiteSpace: "nowrap"}}>
                        {es.codec && <>Codec: {es.codec}<br/></>}
                        {es.compressionPercent && <>Compression: {es.compressionPercent}%<br/></>}
                        {es.originalSize && <>Original: {Strings.humanFileSize(es.originalSize, false)}<br/></>}
                        {es.targetSize && <>Target: {Strings.humanFileSize(es.targetSize, false)}<br/></>}
                    </div>}/>;
                }
                return <Checkbox key={key} checked={video.isTrackEncodingEnabled(key)}
                    onChange={(_ev, data) => {
                        if (data.checked !== "mixed") {
                            video.setTrackEncodingEnabled(key, data.checked);
                        }
                    }}
                    disabled={disabled}
                    label={infoLabel === undefined ? key : <>{key}{infoLabel}</>}
                />;
            })}
        </div>
      </>;
};

function usePrevPropValue<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export const Encoding = ({video}: Props) => {
    const [status, setStatus] = useState(video.status);
    const [message, setMessage] = useState(video.message);

    const previousVideo = usePrevPropValue(video);
    const listener = (video: Video) => {
        setStatus(video.status);
        setMessage(video.message);
    };

    useEffect(() => {
        if (previousVideo !== undefined) {
            video.removeChangeListener(listener);
        }
        video.addChangeListener(listener);
        setStatus(video.status);
        setMessage(video.message);
    }, [previousVideo, video]);
    const progression = video.progression.progress;
    let progressColor: 'brand' | 'success' | 'warning' | 'error' = "brand";
    let validation: 'error' | 'warning' | 'success' | 'none' = "none";

    switch (status) {
        case JobStatus.PAUSED:
        case JobStatus.WARNING:
            progressColor = "warning";
            validation = "warning";
            break;
        case JobStatus.SUCCESS:
            progressColor = "success";
            validation = "success";
            break;
        case JobStatus.ABORTED:
        case JobStatus.ERROR:
            progressColor = "error";
            validation = "error";
            break;
    }

    return <div className="encoding-main" style={{flexGrow: "1"}}>
        {trackTypeEncodingSection(video, TrackType.VIDEO)}
        {trackTypeEncodingSection(video, TrackType.AUDIO, true)}
        <>
            {message !== undefined &&
              <>
                <Divider style={{flexGrow: "0"}}/>
                <div style={{paddingTop: "5px", paddingBottom: "5px"}}>
                  <Field
                    validationMessage={message}
                    validationState={validation}
                  >
                      {progression !== -1 ?
                          <ProgressBar color={progressColor} value={progression} max={1}/> :
                          <div style={{minHeight: "2px"}}/>
                      }
                  </Field>
                </div>
              </>
            }
            <Divider style={{flexGrow: "0"}}/>
            <div className="encoding-buttons">
                <div className="button">
                    <Button size={"medium"} appearance="primary" icon={<WrenchSettings20Regular/>}
                        disabled={video.isQueued()}
                        onClick={() => void video.encode()}>Process</Button>
                </div>
            </div>
        </>
    </div>
}
