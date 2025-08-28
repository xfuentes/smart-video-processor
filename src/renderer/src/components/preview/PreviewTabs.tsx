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

import {useEffect, useReducer, useRef, useState} from "react";
import Video, {VideoType} from "../../common/Video.ts";
import {TrackList} from "./TrackList.tsx";
import {CounterBadge, SelectTabData, SelectTabEvent, SelectTabEventHandler, Tab, TabList} from "@fluentui/react-components";
import {DataUsageSettings20Regular, ResizeVideo20Regular, Search20Regular, SquareHintArrowBack20Regular, TextBulletList20Regular} from "@fluentui/react-icons";
import {Matching} from "./Matching.tsx";
import {ChangeList} from "./Processing.tsx";
import {Hints} from "./Hints.tsx";
import {Encoding} from "./Encoding.tsx";

type Props = {
    video: Video
};

export const PreviewTabs = ({video}: Props) => {
    const listenedVideo = useRef<Video>();
    const [selectedTab, setSelectedTab] = useState("tracks");
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const handleTabSelect: SelectTabEventHandler = (_event: SelectTabEvent, data: SelectTabData) => {
        setSelectedTab(data.value as string);
    };

    useEffect(() => {
        console.log("preview component unmount");
        if (listenedVideo.current !== undefined) {
            console.log("listener removed");
            listenedVideo.current.removeChangeListener(forceUpdate);
            listenedVideo.current = undefined;
        }
    }, [])

    useEffect(() => {
        console.log("preview component's video updated");
        if (listenedVideo.current !== undefined) {
            console.log("listener removed");
            listenedVideo.current.removeChangeListener(forceUpdate);
            listenedVideo.current = undefined;
        }
        setSelectedTab("matching");
        listenedVideo.current = video;
        console.log("listener added to video: " + video.path);
        video.addChangeListener(forceUpdate);
    }, [video]);

    const tracksCount = video.tracks.length;
    let matchingCount = 0;
    if (video.type === VideoType.MOVIE) {
        matchingCount = video.movie.searchResults?.length ?? 0;
    } else if (video.type === VideoType.TV_SHOW) {
        matchingCount = video.tvShow.searchResults?.length ?? 0;
    }

    const changesCount = video.changes.length;
    const encodingCount = video.getTrackEncodingEnabledCount();
    const hintCount = video.hints.length;
    const hintMissing = video.hintMissing();

    return <div style={{
        minHeight: "285px", maxHeight: "285px", overflow: "hidden", padding: "2px",
        display: "flex", flexFlow: "column nowrap"
    }}>
        <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect} size="small">
            <Tab value="matching" icon={<Search20Regular/>}>
                Matching <CounterBadge color={video.matched ? "informative" : "danger"} size={"small"} showZero count={matchingCount}/>
            </Tab>
            <Tab value="tracks" disabled={video.loading} icon={<TextBulletList20Regular/>}>
                Tracks <CounterBadge color={tracksCount === 0 ? "important" : "informative"} size={"small"} count={tracksCount}/>
            </Tab>
            {hintCount > 0 &&
              <Tab value="hints" icon={<SquareHintArrowBack20Regular/>}>
                Hints <CounterBadge color={hintMissing ? "danger" : "informative"} size="small" showZero count={hintCount}/>
              </Tab>
            }
            <Tab value="processing" icon={<DataUsageSettings20Regular/>} disabled={!video.matched || hintMissing}>
                Processing <CounterBadge color="informative" size={"small"} showZero count={changesCount}/>
            </Tab>
            <Tab value="encoding" icon={<ResizeVideo20Regular/>} disabled={(!video.matched || hintMissing)}>
                Encoding <CounterBadge color="informative" size={"small"} showZero count={encodingCount}/>
            </Tab>
        </TabList>
        <div style={{flexGrow: "1", overflow: "auto", display: "flex", flexFlow: "column", padding: "2px"}}>
            {selectedTab === "matching" && <Matching video={video}/>}
            {selectedTab === "tracks" && <TrackList video={video}/>}
            {selectedTab === "hints" && <Hints video={video}/>}
            {selectedTab === "processing" && <ChangeList video={video}/>}
            {selectedTab === "encoding" && <Encoding video={video}/>}
        </div>
    </div>;
};
