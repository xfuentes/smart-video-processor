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


import * as os from 'node:os'
import { execSync } from 'node:child_process'

const isWindows = os.platform() === 'win32';
const version = isWindows ? '26' : '25';

console.log(`Installing electron-builder@${version} ...`);

try {
  execSync(`npm install --no-save electron-builder@${version}`, { stdio: 'inherit' });
  console.log('Installation successful.');
} catch (error) {
  console.error('Installation failed:', error.message);
  process.exit(1);
}
