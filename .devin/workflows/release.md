---
description: Create a new release
---

# Release workflow

1. **Review changes**
   - Run `git status` and `git diff --cached --stat` to inspect uncommitted/staged changes.
   - Classify the release type:
     - **Major** if new features or breaking changes are introduced.
     - **Micro/patch** if it only contains bug fixes.

2. **Update version**
   - Edit `package.json` and bump the `version` field accordingly.

3. **Update changelog**
   - Open `src/renderer/src/components/AboutDialog.tsx`.
   - Add a new `Version X.Y.Z` entry under the **What's new** tab.
   - Keep entries concise and user-focused (only what matters to the end user).

4. **Run tests**
   - Run the test suite locally:
     ```powershell
     npm run test
     ```
   - Continue the workflow only if all tests pass.
   - If any test fails, fix the issues and restart from this step.

5. **Request user approval before committing**
   - Present the changes (version bump, changelog, and any code fixes) to the user.
   - Wait for the user's explicit approval before staging and committing.
   - Once approved, stage any modified files if needed:
     ```powershell
     git add <list of changed files to stage>
     ```
   - Commit with a descriptive message:
     ```powershell
     git commit -m "Release vX.Y.Z: <short summary of changes>"
     ```

6. **Push**
   - Push the release commit to the remote repository:
     ```powershell
     git push
     ```

7. **Tag the release**
   - Create a version tag starting with `v`:
     ```powershell
     git tag vX.Y.Z
     ```
   - Push the tag to the remote repository:
     ```powershell
     git push origin vX.Y.Z
     ```

8. **Update the GitHub release draft changelog**
   - Pushing the tag creates a draft release on GitHub.
   - Update the draft release notes with the changelog entry from `src/renderer/src/components/AboutDialog.tsx`:
     ```powershell
     $notes = @(
       "- <changelog line 1>",
       "- <changelog line 2>"
     )
     $path = "$env:TEMP\vX.Y.Z-notes.txt"
     $notes | Set-Content -Path $path
     gh release edit vX.Y.Z --notes-file $path --repo xfuentes/smart-video-processor
     Remove-Item $path
     ```
   - For version 1.7.0, the notes are:
     ```
     - Redesigned TV show matching with more search options (by title, TVDB ID, episode number or episode name)
     - Improved episode matching for absolute-numbered series
     - Better handling of missing or not-found episodes with clearer messages
     ```
   - Alternatively, open the draft release on the GitHub **Releases** page and paste the notes manually if `gh` is not available.
