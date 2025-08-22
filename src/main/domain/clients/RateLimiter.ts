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

export class RateLimiter {
    /**
     * @private rate in terms of request per second allowed.
     */
    private _rate: number;
    private _lastTimestamp: number = 0;

    constructor(rate:number) {
        this._rate = rate;
    }

    public setRate(rate: number) {
        this._rate = rate;
    }

    public async slows() {
        const now = Date.now();
        const pause = Math.round(1000 / this._rate);
        if (this._lastTimestamp) {
            const wait = pause - (now - this._lastTimestamp);
            if (wait > 0) {
                this._lastTimestamp = now + wait;
                await new Promise(res => setTimeout(res, wait));
            } else {
                this._lastTimestamp = now;
            }
        } else {
            this._lastTimestamp = now;
        }
    }
}