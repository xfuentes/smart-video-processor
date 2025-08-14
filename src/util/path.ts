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

import Files from "./files.ts";
import {PlatformPath} from "path";

const nodePath = require("path") as PlatformPath;

export const pathJoin = (...paths: string[]): string => {
    return nodePath.join(...paths);
};

export const pathBasename = (path: string, suffix?: string): string => {
    return nodePath.basename(path, suffix);
};

export const pathDirname = (path: string): string => {
    return nodePath.dirname(path);
};

export const pathIsAbsolute = (path: string): boolean => {
    return nodePath.isAbsolute(path);
};

export const getConfigPath = (): string => {
    let path;
    if (typeof (nw) !== "undefined") {
        path = nodePath.normalize(nw.App.dataPath + "/../../");
    } else {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const applicationConfigPath: (name: string) => string = require("application-config-path").default;
        path = applicationConfigPath("smart-video-processor");
    }

    if (!Files.existsSync(path)) {
        Files.mkdirSync(path, {recursive: true});
    }
    return path;
};

export const pathSep = nodePath.sep;
