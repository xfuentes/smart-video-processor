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

import {pathJoin} from "./path.ts";
import {MakeDirectoryOptions, Mode, PathLike, Stats} from "node:fs";
import http from "node:http";
import {debug} from "./log.ts";

/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

const nodeFs = require("fs");
const nodeHttps = require('https');

export default class Files {
    static loadTextFileSync(dir: string, name: string, encoding: BufferEncoding = "utf8"): string | undefined {
        const filename = pathJoin(dir, name);
        try {
            debug("Loading file " + filename);
            nodeFs.accessSync(filename, nodeFs.constants.R_OK);
            const buffer = nodeFs.readFileSync(filename);
            return buffer.toString(encoding);
        } catch (err) {
            console.log(err);
        }
    }

    static writeFile(dir: string, name: string, data: string | Buffer = "", encoding: BufferEncoding = "utf8"): Promise<string> {
        return new Promise((resolve, reject) => {
            const filename = pathJoin(dir, name);
            nodeFs.writeFile(filename, data, encoding, (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    return reject(err);
                }
                resolve(filename);
            })
        });
    }

    static writeFileSync(dir: string, name: string, data: string | Buffer = "", encoding = "utf8") {
        const filename = pathJoin(dir, name);
        debug("Writing file " + filename);
        nodeFs.writeFileSync(filename, data, encoding);
    }

    static makeTempPath(template: string): string {
        const tempPath = pathJoin(process.cwd(), template);
        return nodeFs.mkdtempSync(tempPath);
    }

    static cleanupTempPaths(template: string) {
        const tempPath = pathJoin(process.cwd());
        if (nodeFs.existsSync(tempPath)) {
            nodeFs.readdirSync(tempPath).forEach((file: string) => {
                if (file.startsWith(template)) {
                    const curPath = pathJoin(tempPath, file);
                    this.deleteFolderRecursive(curPath);
                }
            });
        }
    }

    static deleteFolderRecursive(path: string) {
        if (nodeFs.existsSync(path)) {
            nodeFs.readdirSync(path).forEach((file: string) => {
                const curPath = pathJoin(path, file);
                if (nodeFs.lstatSync(curPath).isDirectory()) {
                    Files.deleteFolderRecursive(curPath);
                } else {
                    Files.unlinkSync(curPath);
                }
            });
            nodeFs.rmdirSync(path);
        }
    };

    static unlinkSync(path: PathLike) {
        nodeFs.unlinkSync(path);
    }

    static removeSpecialCharsFromFilename(filename: string): string {
        filename = filename.replace(/:/g, "։"); // U+0589
        filename = filename.replace(/\?\?/g, "⁇"); // U+2047
        filename = filename.replace(/!\?/g, "⁉"); // U+2049
        filename = filename.replace(/\?!/g, "⁈"); // U+2048
        filename = filename.replace(/\?/g, "﹖"); // U+FF1F
        filename = filename.replace(/!/g, "ǃ"); // U+01C3
        filename = filename.replace(/"/g, "”"); // U+201D
        filename = filename.replace(/\*/g, "🟉"); // U+1F7C9
        filename = filename.replace(/\//g, "∕"); // U+2215
        return filename;
    }

    static restoreSpecialCharsFromFilename(filename: string) {
        filename = filename.replace(/\u0589/g, ":");
        filename = filename.replace(/\u2047/g, "??");
        filename = filename.replace(/\u2049/g, "!?");
        filename = filename.replace(/\u2048/g, "?!");
        filename = filename.replace(/\uFF1F/g, "?");
        filename = filename.replace(/\u01C3/g, "!");
        filename = filename.replace(/\u201D/g, "\"");
        filename = filename.replace(/\u1F7C9/g, "*");
        filename = filename.replace(/\u2215/g, "/");
        return filename;
    }

    static cleanFilename(filename: string) {
        const pos: number = filename.lastIndexOf(".");
        if (pos > 0) {
            // Remove extension
            filename = filename.substring(0, pos);
        }

        if (filename.split(" ").length < 3) {
            filename = filename.replace(/[.\-_]/gu, " ");
        }
        filename = filename.replace(/^epz-/i, "");
        filename = filename.replace(/\s+/g, " ").trim();

        return this.restoreSpecialCharsFromFilename(filename);
    }

    static megaTrim(input: string) {
        input = input.replace(/^[.\-_\s]*/, "");
        input = input.replace(/[.\-_\s]*$/, "");
        return input;
    }

    static extractArgs(args: string[]) {
        let escape = false;
        let instr = false;
        const arr = [];
        let arg = "";
        for (const c of args) {
            if (!escape) {
                if (c === "\"") {
                    instr = !instr;
                } else if (c === "\\") {
                    escape = true;
                } else if (c === " ") {
                    if (!instr) {
                        arr.push(arg);
                        arg = "";
                    } else {
                        arg += c;
                    }
                } else {
                    arg += c;
                }
            } else {
                if (c === "\"" || c === "\\") {
                    arg += c;
                } else {
                    arg += "\\" + c;
                }
                escape = false;
            }
        }
        if (arg) {
            arr.push(arg);
        }
        return arr;
    }

    /*    static async downloadFile(url: string, directory: string, filename: string) {
            const axios = require('axios').default;
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });
            return await Files.writeFile(directory, filename, Buffer.from(response.data), "binary");
        }
    */
    static downloadFile(url: string, directory: string, filename: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const path = pathJoin(directory, filename);
            const file = nodeFs.createWriteStream(path);

            nodeHttps.get(url, (response: http.IncomingMessage) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        resolve(path);
                    });
                });
            }).on('error', (err: Error) => {
                nodeFs.unlink(path, () => {
                    console.log(err);
                    reject(new Error('Error downloading file. ' + err.message));
                });
            });
        });
    }

    static fileExistsAndIsReadable(path: PathLike): boolean {
        try {
            nodeFs.accessSync(path, nodeFs.constants.F_OK | nodeFs.constants.R_OK);
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Synchronous stat(2) - Get file status.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    static statSync(path: PathLike): Stats {
        return nodeFs.statSync(path);
    }

    /**
     * Synchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    static mkdirSync(path: PathLike, options?: Mode | MakeDirectoryOptions | null) {
        return nodeFs.mkdirSync(path, options);
    }

    /**
     * Returns `true` if the path exists, `false` otherwise.
     *
     * For detailed information, see the documentation of the asynchronous version of
     * this API: {@link exists}.
     *
     * `fs.exists()` is deprecated, but `fs.existsSync()` is not. The `callback` parameter to `fs.exists()` accepts parameters that are inconsistent with other
     * Node.js callbacks. `fs.existsSync()` does not use a callback.
     *
     * ```js
     * import { existsSync } from 'node:fs';
     *
     * if (existsSync('/etc/passwd'))
     *   console.log('The path exists.');
     * ```
     * @since v0.1.21
     */
    static existsSync(path: PathLike) {
        return nodeFs.existsSync(path);
    }
};
