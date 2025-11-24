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
import * as fs from 'fs';
import * as path from 'path';

import packageJSON from "../package.json" with { type: "json" };

const args = process.argv.slice(2);
const dirPath = args[0];

// Validate directory path is provided
if (!dirPath) {
  console.error('Error: Please provide a directory path as the first argument.');
  console.log('Usage: node configure.js <directory-path>');
  process.exit(1);
}

const resolvedDir = path.resolve(dirPath);

// Check if directory exists and is readable
fs.readdir(resolvedDir, (err, files) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('Error: Directory not found:', resolvedDir);
    } else {
      console.error('Error reading directory:', err);
    }
    process.exit(1);
  }

  // Filter files ending with .in
  const inFiles = files.filter(file => path.basename(file).indexOf('.in.') !== -1);

  if (inFiles.length === 0) {
    console.log('No files containing ".in" found in:', resolvedDir);
    return;
  }

  inFiles.forEach(file => {
    const source = path.join(resolvedDir, file);
    const dest = path.join(resolvedDir, path.basename(file).replace('.in', ''));

    // Read .in file
    fs.readFile(source, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading ${source}:`, err);
        return;
      }

      let modifiedData = data.toString().replace(/__NAME__/g, packageJSON.name);
      modifiedData = modifiedData.replace(/__VERSION__/g, packageJSON.version);
      modifiedData = modifiedData.replace(/__DESCRIPTION__/g, packageJSON.description);
      modifiedData = modifiedData.replace(/__ARCH__/g, process.arch);

      // Write output file
      fs.writeFile(dest, modifiedData, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing ${dest}:`, err);
        } else {
          console.log(`Generated: ${source} → ${dest}`);
        }
      });
    });
  });
});
