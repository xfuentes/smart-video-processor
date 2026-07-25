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

4. **Commit**
   - Stage `package.json` and `AboutDialog.tsx` (plus any other modified files if needed):
     ```powershell
     git add package.json src/renderer/src/components/AboutDialog.tsx
     ```
   - Commit with a descriptive message:
     ```powershell
     git commit -m "Release vX.Y.Z: <short summary of changes>"
     ```

5. **Push**
   - Push the release commit to the remote repository:
     ```powershell
     git push
     ```
