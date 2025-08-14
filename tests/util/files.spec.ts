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

import {expect, test} from "vitest";
import Files from "../../src/util/files";
import {Stats} from "node:fs";

const nodeFs = require("fs");

test('Download a poster from TVDB', async () => {
    const path = await Files.downloadFile("https://artworks.thetvdb.com/banners/episodes/79168/303854.jpg", "./", "test.jpg");
    expect(path).toBe("test.jpg");
    const stats: Stats = await nodeFs.lstatSync(path);
    expect(stats.size).toBe(87572);
    expect(stats.isFile()).toBeTruthy();
    nodeFs.unlinkSync(path);
});

