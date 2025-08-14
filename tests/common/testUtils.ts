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

import {Change, ChangeSourceType} from "../../src/common/Change";
import Video from "../../src/common/Video";
import {Hint} from "../../src/common/Hint";
import Job, {JobStatus} from "../../src/common/jobs/Job";
import {ChildProcessWithoutNullStreams} from "node:child_process";
import Files from "../../src/util/files";
import {EncoderSettings} from "../../src/common/Encoding";
import {SpawnOptionsWithStdioTuple, StdioPipe} from "child_process";
import {Progression} from "../../src/util/processes";

export const changeListToMap = (changes: Change[]) => {
    return changes.reduce((previousValue, currentValue) => {
        const key = Video.sourceTypeTrackIDToSource(currentValue.sourceType, currentValue.trackId);
        const key2 = currentValue.changeType + (currentValue.property ? "_" + currentValue.property : "");
        return {...previousValue, [key]: {...(previousValue[key] ?? {}), [key2]: currentValue}};
    }, {});
};

export const hintListToMap = (hints: Hint[]) => {
    return hints.reduce((previousValue, currentValue) => {
        const key = currentValue.type + " " + currentValue.trackId;
        return {...previousValue, [key]: currentValue.value};
    }, {});
};

export const encoderSettingsListToMap = (settings: EncoderSettings[]) => {
    return settings.reduce((previousValue, currentValue) => {
        const key = Video.sourceTypeTrackIDToSource(currentValue.trackType as unknown as ChangeSourceType, currentValue.trackId);
        return {...previousValue, [key]: currentValue};
    }, {});
};

export type JobStateChange = {
    status?: JobStatus,
    progression?: Progression
};

export const recordJobStates = (job: Job<object | unknown>, stateChanges: JobStateChange[]) => {
    const listener = (j: Job<unknown>) => {
        const lastIdx = stateChanges.length - 1;
        const lastChange = lastIdx >= 0 ? stateChanges[lastIdx] : undefined;
        const newChange: JobStateChange = {};
        if (j.getStatus() !== lastChange?.status || j.getProgression().progress !== lastChange?.progression.progress) {
            newChange.status = j.getStatus();
            newChange.progression = j.getProgression();
            stateChanges.push(newChange);
        }
        if (j.isFinished()) {
            job.removeChangeListener(listener);
        }
    };
    job.addChangeListener(listener);
}

export const simulateMKVMergeProgression = () => {
    let dataListener = undefined;
    let closeListener = undefined;

    for (const ep of ["0%", "25%", "50%", "75%", "100%"]) {
        setImmediate(() => {
            dataListener(`Progress: ${ep}`);
        });
    }
    setImmediate(() => {
        closeListener(0);
    });

    return {
        pid: 1234, on: (event, listener) => {
            if (event === "close") {
                closeListener = listener;
            }
        }, stdout: {
            on: (event, listener) => {
                if (event === "data") {
                    dataListener = listener;
                }
            }
        }
    } as unknown as ChildProcessWithoutNullStreams;
};

const recordedProgresses = [
    "frame=128\n" +
    "fps=12.8\n" +
    "stream_0_0_q=28.0\n" +
    "bitrate=   3.0kbits/s\n" +
    "total_size=1911\n" +
    "out_time_ms=5088000\n" +
    "out_time=00:00:05.088000\n" +
    "dup_frames=0\n" +
    "drop_frames=0\n" +
    "speed=0.508x\n" +
    "progress=continue\n",

    "frame=326\n" +
    "fps=31.0\n" +
    "stream_0_0_q=28.0\n" +
    "bitrate=1054.0kbits/s\n" +
    "total_size=1715887\n" +
    "out_time_ms=13024000\n" +
    "out_time=00:00:13.024000\n" +
    "dup_frames=0\n" +
    "drop_frames=0\n" +
    "speed=1.24x\n" +
    "progress=continue\n",

    "frame=532\n" +
    "fps=48.3\n" +
    "stream_0_0_q=28.0\n" +
    "bitrate= 941.3kbits/s\n" +
    "total_size=2503754\n" +
    "out_time_ms=21280000\n" +
    "out_time=00:00:21.280000\n" +
    "dup_frames=0\n" +
    "drop_frames=0\n" +
    "speed=1.93x\n" +
    "progress=continue\n",

    "frame=718\n" +
    "fps=62.4\n" +
    "stream_0_0_q=28.0\n" +
    "bitrate=1134.6kbits/s\n" +
    "total_size=4071064\n" +
    "out_time_ms=28704000\n" +
    "out_time=00:00:28.704000\n" +
    "dup_frames=0\n" +
    "drop_frames=0\n" +
    "speed=2.49x\n" +
    "progress=continue\n",

    "frame=750\n" +
    "fps=64.1\n" +
    "stream_0_0_q=-1.0\n" +
    "bitrate=1284.0kbits/s\n" +
    "total_size=4812582\n" +
    "out_time_ms=29984000\n" +
    "out_time=00:00:29.984000\n" +
    "dup_frames=0\n" +
    "drop_frames=0\n" +
    "speed=2.56x\n" +
    "progress=end\n"
];

export const simulateFFmpegProgression =
    (command: string, args: readonly string[], options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>): ChildProcessWithoutNullStreams => {
        let dataListener = undefined;
        let closeListener = undefined;

        for (let i = 0; i < 10; i++) {
            setImmediate(() => {
                dataListener("frame=0\n" +
                    "fps=0.0\n" +
                    "stream_0_0_q=0.0\n" +
                    "bitrate=N/A\n" +
                    "total_size=0\n" +
                    "out_time_ms=0\n" +
                    "out_time=00:00:00.000000\n" +
                    "dup_frames=0\n" +
                    "drop_frames=0\n" +
                    "speed=   0x\n");
            });
        }

        for (const rp of recordedProgresses) {
            setImmediate(() => {
                dataListener(rp);
            });
        }
        setImmediate(() => {
            closeListener(0);
        });

        return {
            pid: 1234, on: (event, listener) => {
                if (event === "close") {
                    closeListener = listener;
                }
            }, stdout: {
                on: (event, listener) => {
                    if (event === "data") {
                        dataListener = listener;
                    }
                }
            }
        } as unknown as ChildProcessWithoutNullStreams;
    };

export const simulateMKVmergeFailure = () => {
    let dataListener = undefined;
    let closeListener = undefined;

    setImmediate(() => {
        dataListener("Error: The file '-P' could not be opened for reading: open file error.");
    });
    setImmediate(() => {
        closeListener(2);
    });

    return {
        pid: 12345, on: (event, listener) => {
            if (event === "close") {
                closeListener = listener;
            }
        }, stdout: {
            on: (event, listener) => {
                if (event === "data") {
                    dataListener = listener;
                }
            }
        }
    } as unknown as ChildProcessWithoutNullStreams;
};

export const simulateFFmpegFailure = () => {
    let stderrListener = undefined;
    let closeListener = undefined;

    setImmediate(() => {
        if(stderrListener !== undefined) {
            stderrListener("Unrecognized option 'opt'.\n");
            stderrListener("Error splitting the argument list: Option not found\n");
        }
    });
    setImmediate(() => {
        closeListener(1);
    });

    return {
        pid: 12345, on: (event, listener) => {
            if (event === "close") {
                closeListener = listener;
            }
        }, stderr: {
            on: (event, listener) => {
                if (event === "data") {
                    stderrListener = listener;
                }
            }
        }
    } as unknown as ChildProcessWithoutNullStreams;
};

export const simulateProgramNotFound = (program: string, args: readonly string[]) => {
    let errorListener = undefined;

    setImmediate(() => {
        errorListener({
            "errno": -4058,
            "code": "ENOENT",
            "syscall": `spawn ${program}`,
            "path": program,
            "spawnargs": args
        });
    });

    return {
        pid: 12345, on: (event, listener) => {
            if (event === "error") {
                errorListener = listener;
            }
        }
    } as unknown as ChildProcessWithoutNullStreams;
};

export const simulateFileInfoResponse = (jsonFileName: string): ChildProcessWithoutNullStreams => {
    let dataListener = undefined;
    let closeListener = undefined;
    setImmediate(() => {
        const mkvMergeFileInfoResult = Files.loadTextFileSync("./tests/resources", jsonFileName);
        dataListener(mkvMergeFileInfoResult);
    });
    setImmediate(() => {
        closeListener(0);
    });

    return {
        pid: 1234, on: (event, listener) => {
            if (event === "close") {
                closeListener = listener;
            }
        }, stdout: {
            on: (event, listener) => {
                if (event === "data") {
                    dataListener = listener;
                }
            }
        }
    } as unknown as ChildProcessWithoutNullStreams;
};

