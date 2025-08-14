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

import {expect, test, vi} from "vitest";
import Processes from "../../../src/util/processes";
import ProcessingJob from "../../../src/common/jobs/ProcessingJob";
import {Change} from "../../../src/common/Change";
import {changeListToMap, JobStateChange, recordJobStates, simulateMKVmergeFailure, simulateMKVMergeProgression} from "../testUtils";
import {pathBasename} from "../../../src/util/path";

test('Processing Progression data', async () => {
    vi.spyOn(Processes, "setPriority").mockImplementation(vi.fn());
    const spawnSpy = vi.spyOn(Processes, "spawn").mockImplementation(simulateMKVMergeProgression);
    const fullPath = "C:\\Download\\something.mkv";
    const changes = [
        {
            "uuid": "4a98799c-f5a9-489a-b0b0-6b4e1bd797db",
            "sourceType": "Container",
            "changeType": "Update",
            "property": "Filename",
            "currentValue": "Captain.America.Brave.New.World.2025.MULTi.VFF.1080p.WEBRip.DDP5.1.Atmos.HEVC-[PSA]-BATGirl.mkv",
            "newValue": "Captain America։ Brave New World (2025).mkv"
        },
        {
            "uuid": "187b1ff1-c406-4f1f-bb26-568029b9ae1f",
            "sourceType": "Container",
            "changeType": "Attach",
            "property": "Poster Image",
            "newValue": "C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-QxfMkk\\TMDB-822119\\cover.jpg"
        }
    ] as Change[];
    const changesMap = changeListToMap(changes);
    const job: ProcessingJob = new ProcessingJob(pathBasename(fullPath),fullPath, changes, [], "C:\\Download\\Reworked");
    const stateChanges: JobStateChange[] = [];
    recordJobStates(job, stateChanges);
    expect(job.isFinished()).toBe(false);
    expect(job.isSuccess()).toBe(false);
    await job.queue();
    expect(job.isFinished()).toBe(true);
    expect(job.isSuccess()).toBe(true);

    const spawnArgs = spawnSpy.mock.lastCall[1];
    const uiLangIdx = spawnArgs.indexOf("--ui-language");
    expect(uiLangIdx).toBeGreaterThanOrEqual(0);
    expect(spawnArgs[uiLangIdx + 1]).toBe("en");

    const outputIdx = spawnArgs.indexOf("--output");
    expect(outputIdx).toBeGreaterThanOrEqual(0);
    expect(spawnArgs[outputIdx + 1]).toBe("C:\\Download\\Reworked\\" + changesMap["Container"]["Update_Filename"].newValue);

    const progresses: number[] = stateChanges.map(c => c.progression.progress);
    expect(progresses).toStrictEqual([undefined, undefined, 0, 0.25, 0.5, 0.75, 1, -1]);
});

test('Failing Processing Job', async () => {
    vi.spyOn(Processes, "setPriority").mockImplementation(vi.fn());
    vi.spyOn(Processes, "spawn").mockImplementation(simulateMKVmergeFailure);
    const fullPath = "C:\\Download\\something.mkv";
    const changes = [
        {
            "uuid": "4a98799c-f5a9-489a-b0b0-6b4e1bd797db",
            "sourceType": "Container",
            "changeType": "Update",
            "property": "Filename",
            "currentValue": "Captain.America.Brave.New.World.2025.MULTi.VFF.1080p.WEBRip.DDP5.1.Atmos.HEVC-[PSA]-BATGirl.mkv",
            "newValue": "Captain America։ Brave New World (2025).mkv"
        },
        {
            "uuid": "187b1ff1-c406-4f1f-bb26-568029b9ae1f",
            "sourceType": "Container",
            "changeType": "Attach",
            "property": "Poster Image",
            "newValue": "C:\\Users\\xfuentes\\Documents\\Projets\\smart-video-processor\\tmp-svp-QxfMkk\\TMDB-822119\\cover.jpg"
        }
    ] as Change[];
    const job: ProcessingJob = new ProcessingJob(pathBasename(fullPath),fullPath, changes, [], "C:\\Download\\Reworked");
    const stateChanges: JobStateChange[] = [];
    recordJobStates(job, stateChanges);
    expect(job.isStarted()).toBe(false);
    expect(job.isFinished()).toBe(false);
    expect(job.isSuccess()).toBe(false);
    expect(job.isProcessing()).toBe(false);
    try {
        await job.queue();
    } catch (err) {
        expect(err.message).toBe("The file '-P' could not be opened for reading: open file error.");
    }
    //await expect(job.queue()).rejects.toThrowError("The file '-P' could not be opened for reading: open file error.")
    // await job.queue();
    expect(job.isProcessing()).toBe(false);
    expect(job.isStarted()).toBe(true);
    expect(job.isError()).toBe(true);
    expect(job.isSuccess()).toBe(false);
});