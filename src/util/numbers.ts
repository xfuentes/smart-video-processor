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

export default class Numbers {
    static toNumber(num: string | undefined): number | undefined {
        if (num === undefined) {
            return undefined;
        }
        const response = Number.parseInt(num, 10);
        return Number.isNaN(response) ? undefined : response;
    }

    static durationToSeconds(duration: string | undefined): number | undefined {
        if (duration === undefined) {
            return undefined;
        } else {
            const millisPos = duration.indexOf(".");
            let millis = 0;
            if (millisPos >= 0) {
                millis = Number.parseFloat("0" + duration.substring(millisPos));
                duration = duration.substring(0, millisPos);
            }
            const [hours, minutes, seconds] = duration.split(':').map(Number);
            return hours * 3600 + minutes * 60 + seconds + millis;
        }
    }
};