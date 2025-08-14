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

import Video from "../common/Video.ts";
import CLI from "clui";
import chalk from "chalk";
import {qualityRenderer, sizeRenderer} from "./renderers.ts";

export const renderVideoList = (outputBuffer: CLI.LineBuffer, video: Video) => {
    const fitWidth = outputBuffer.width() - 22;
    const rLine = new CLI.Line(outputBuffer)
        .column(chalk.blueBright("Processing File"), fitWidth)
        .column(chalk.blueBright("Size"), 10)
        .column(chalk.blueBright("Quality"), 12);
    rLine.fill().output();

    const dataLine = new CLI.Line(outputBuffer)
        .column(video.filename, fitWidth)
        .column(sizeRenderer(video.size), 10)
        .column(qualityRenderer(video.getPixels()), 12);
    dataLine.fill().output();
    console.log();
};
