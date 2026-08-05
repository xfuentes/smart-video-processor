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

3. **Update changelog and About dialog**
   - Open `CHANGELOG.md` and move the current `## [Unreleased]` entries into a new `## [X.Y.Z] - YYYY-MM-DD` section at the top (use the new version and today's date).
   - Remove the now-empty `## [Unreleased]` heading from the release commit. An `## [Unreleased]` section is only allowed during active development; the `changelog` skill will re-create it when the next change is added.
   - Open `src/renderer/src/components/AboutDialog.tsx`.
   - Insert a new `Version X.Y.Z` entry at the top of the **What's new** tab, using the bullet points from the versioned `CHANGELOG.md` section.
   - Keep entries concise and user-focused (only what matters to the end user).

4. **Translate missing strings with Google Translate**
   - Ensure `GOOGLE_API_KEY` is set in the environment.
   - First sync the locale files so that all `locales/*.json` files contain the same keys as `locales/en.json` (see the `translation` skill for the re-serialization procedure).
   - For every non-English locale, translate each new English source string with the Google Cloud Translation API **before committing the release**:
     - Endpoint: `https://translation.googleapis.com/language/translate/v2`
     - POST a JSON body with `q=<text>`, `source='en'`, `target=<locale>` (e.g. `fr`, `de`, `es`, `pt-BR`, `nb`, `ja`, `ko`, `zh-CN`, ...), and `format='text'`, plus the `key` query parameter set to `GOOGLE_API_KEY`.
     - The translated text is at `data.translations[0].translatedText`.
     - Preserve ICU placeholders such as `{version}`, `{num}`, `{count}`, etc. Do not translate words inside braces.
     - Multi-line strings (e.g. changelog bullet lists) should be translated line-by-line so that the bullet order is preserved.
   - If a locale is not supported by Google Translate, keep the English fallback and add a note in the release summary.
   - Validate JSON syntax, consistent key sets across all locale files, and no escaped apostrophes (`\'`).

5. **Run tests**
   - Run the test suite locally:
     ```powershell
     npm run test
     ```
   - Continue the workflow only if all tests pass.
   - If any test fails, fix the issues and restart from this step.

6. **Request user approval before committing**
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

7. **Push**
   - Push the release commit to the remote repository:
     ```powershell
     git push
     ```

8. **Tag the release**
   - Create a version tag starting with `v`:
     ```powershell
     git tag vX.Y.Z
     ```
   - Push the tag to the remote repository:
     ```powershell
     git push origin vX.Y.Z
     ```

9. **Update the GitHub release draft changelog**
   - Pushing the tag creates a draft release on GitHub.
   - Update the draft release notes with the `CHANGELOG.md` entry for version `X.Y.Z` **without publishing the release**:
     ```powershell
     $notes = @(
       "- <changelog line 1>",
       "- <changelog line 2>"
     )
     $path = "$env:TEMP\vX.Y.Z-notes.txt"
     $notes | Set-Content -Path $path
     gh release edit vX.Y.Z --draft --notes-file $path --repo xfuentes/smart-video-processor
     Remove-Item $path
     ```
   - Do **not** publish the release on GitHub until all package artifacts have finished uploading.
   - For version 1.7.0, the notes are:
     ```
     - Redesigned TV show matching with more search options (by title, TVDB ID, episode number or episode name)
     - Improved episode matching for absolute-numbered series
     - Better handling of missing or not-found episodes with clearer messages
     ```
   - Alternatively, open the draft release on the GitHub **Releases** page and paste the notes manually if `gh` is not available.

10. **Create a new draft Microsoft Store submission and update release notes**
    - This step reads the GitHub draft release notes, creates a new in-progress Store submission, translates the notes into all supported languages from `metadata.json`, and updates the submission.
    - Make sure the environment variables `AZURE_AD_TENANT_ID`, `AZURE_AD_GH_CLIENT_ID`, `AZURE_AD_GH_SECRET`, and `GOOGLE_API_KEY` are set.
    - Run the following PowerShell script after replacing `vX.Y.Z` with the actual version tag:
      ```powershell
      $ErrorActionPreference = 'Stop'

      $tag = 'vX.Y.Z'
      $appId = '9PG7L9JR8K6M'
      $tenantId = $env:AZURE_AD_TENANT_ID
      $clientId = $env:AZURE_AD_GH_CLIENT_ID
      $clientSecret = $env:AZURE_AD_GH_SECRET
      $googleKey = $env:GOOGLE_API_KEY
      $metadataPath = Join-Path (Get-Location) 'assets\appx\metadata.json'

      $release = gh release view $tag --json body | ConvertFrom-Json
      $notes = $release.body
      if ([string]::IsNullOrWhiteSpace($notes)) {
        throw 'Release notes are empty.'
      }

      $targetLangs = @{
        'fr-fr' = 'fr'
        'de-de' = 'de'
        'it-it' = 'it'
        'es-es' = 'es'
        'pt-br' = 'pt-BR'
        'nl-nl' = 'nl'
        'zh-cn' = 'zh-CN'
        'ja-jp' = 'ja'
        'ko-kr' = 'ko'
        'ru-ru' = 'ru'
        'ar-sa' = 'ar'
      }

      function Get-Translation($text, $target) {
        $wc = New-Object System.Net.WebClient
        $wc.Encoding = [System.Text.Encoding]::UTF8
        $wc.Headers.Add('Content-Type', 'application/json; charset=utf-8')
        $body = @{ q = $text; source = 'en'; target = $target; format = 'text' } | ConvertTo-Json
        $json = $wc.UploadString("https://translation.googleapis.com/language/translate/v2?key=$googleKey", 'POST', $body) | ConvertFrom-Json
        return $json.data.translations[0].translatedText
      }

      function Get-StoreToken() {
        $body = @{ grant_type = 'client_credentials'; client_id = $clientId; client_secret = $clientSecret; scope = 'https://manage.devcenter.microsoft.com/.default' }
        $res = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -Method POST -Body $body
        return $res.access_token
      }

      $token = Get-StoreToken
      $authHeaders = @{ Authorization = "Bearer $token" }
      $jsonHeaders = $authHeaders + @{ 'Content-Type' = 'application/json; charset=utf-8' }

      $app = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId" -Method GET -Headers $authHeaders
      $submissionId = $app.pendingApplicationSubmission.id

      if (-not $submissionId) {
        $new = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions" -Method POST -Headers $jsonHeaders -Body ''
        $submissionId = $new.id
      }

      $submission = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions/$submissionId" -Method GET -Headers $authHeaders

      $metadata = Get-Content $metadataPath -Raw -Encoding UTF8 | ConvertFrom-Json
      $docsImgDir = Join-Path (Get-Location) 'docs\img'

      $imgFiles = Get-ChildItem (Join-Path $docsImgDir '*.png') -File | Sort-Object Name | Select-Object -First 10
      $imgList = foreach ($img in $imgFiles) {
        @{
          fileName = $img.Name
          imageType = 'Screenshot'
          fileStatus = 'PendingUpload'
        }
      }

      foreach ($locale in $metadata.listings.PSObject.Properties.Name) {
        $bl = $metadata.listings.$locale.baseListing
        # Partner Center limits: up to 20 features of 200 chars and 7 keywords of 30 chars.
        # Truncate at runtime so translated content does not exceed the limits.
        if ($bl.features) {
          $bl.features = ($bl.features | Select-Object -First 20 | ForEach-Object { $_.Substring(0, [System.Math]::Min(200, $_.Length)) })
        }
        if ($bl.keywords) {
          $bl.keywords = ($bl.keywords | Select-Object -First 7 | ForEach-Object { $_.Substring(0, [System.Math]::Min(30, $_.Length)) })
        }
        $bl.title = 'Smart Video Processor'
        $bl.images = $imgList
      }

      foreach ($locale in $metadata.listings.PSObject.Properties.Name) {
        if ($locale -eq 'en-us') {
          $metadata.listings.$locale.baseListing.releaseNotes = $notes
        } elseif ($targetLangs.ContainsKey($locale)) {
          $translated = Get-Translation $notes $targetLangs[$locale]
          $metadata.listings.$locale.baseListing.releaseNotes = $translated
        }
      }

      $submission.listings = $metadata.listings

      $payload = $submission | ConvertTo-Json -Depth 100
      $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
      Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions/$submissionId" -Method PUT -Headers $authHeaders -ContentType 'application/json; charset=utf-8' -Body $payloadBytes

      Write-Output "Submission $submissionId updated with translated release notes."
      ```
    - Verify in Partner Center that the draft submission has the translated release notes before publishing.

11. **Upload the Windows packages and submit for certification**
    - Wait for the `package-win32.yml` GitHub Actions workflow to finish building and uploading `smart-video-processor-x64.appx` and `smart-video-processor-arm64.appx` to the GitHub draft release.
    - Make sure `AZURE_AD_TENANT_ID`, `AZURE_AD_GH_CLIENT_ID`, and `AZURE_AD_GH_SECRET` are set. `curl.exe` must be available.
    - Run the following PowerShell script, replacing `vX.Y.Z` with the actual tag:
      ```powershell
      $ErrorActionPreference = 'Stop'

      $tag = 'vX.Y.Z'
      $appId = '9PG7L9JR8K6M'
      $tenantId = $env:AZURE_AD_TENANT_ID
      $clientId = $env:AZURE_AD_GH_CLIENT_ID
      $clientSecret = $env:AZURE_AD_GH_SECRET

      $needed = @('smart-video-processor-x64.appx','smart-video-processor-arm64.appx')

      $release = gh release view $tag --json assets | ConvertFrom-Json
      $assets = $release.assets | Where-Object { $needed -contains $_.name }
      if ($assets.Count -ne 2) { throw 'Missing package assets on the GitHub release.' }

      $docsImgDir = Join-Path (Get-Location) 'docs\img'

      $temp = Join-Path $env:TEMP "store-$tag"
      Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
      New-Item -ItemType Directory -Path $temp -Force | Out-Null
      gh release download $tag -p $needed[0] -p $needed[1] --dir $temp --clobber

      $imgFiles = Get-ChildItem (Join-Path $docsImgDir '*.png') -File | Sort-Object Name | Select-Object -First 10
      Copy-Item -Path $imgFiles -Destination $temp

      $found = Get-ChildItem $temp -File | Where-Object { $needed -contains $_.Name }

      Add-Type -AssemblyName System.IO.Compression.FileSystem
      function Get-AppxManifest($path) {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
        $entry = $zip.GetEntry('AppxManifest.xml')
        $stream = $entry.Open()
        $reader = [System.IO.StreamReader]::new($stream)
        $xml = $reader.ReadToEnd()
        $reader.Dispose()
        $stream.Dispose()
        $zip.Dispose()
        [xml]$manifest = $xml
        return $manifest
      }

      function Get-AppxVersion($path) {
        return (Get-AppxManifest $path).Package.Identity.Version
      }

      function Get-AppxLanguages($path) {
        $manifest = Get-AppxManifest $path
        return @($manifest.Package.Resources.Resource | ForEach-Object { $_.Language })
      }

      function Get-StoreToken() {
        $body = @{ grant_type = 'client_credentials'; client_id = $clientId; client_secret = $clientSecret; scope = 'https://manage.devcenter.microsoft.com/.default' }
        $res = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token" -Method POST -Body $body
        return $res.access_token
      }

      $zip = Join-Path $env:TEMP "store-$tag.zip"
      Remove-Item -Force $zip -ErrorAction SilentlyContinue
      [System.IO.Compression.ZipFile]::CreateFromDirectory($temp, $zip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

      $token = Get-StoreToken
      $authHeaders = @{ Authorization = "Bearer $token" }
      $jsonHeaders = $authHeaders + @{ 'Content-Type' = 'application/json; charset=utf-8' }

      $app = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId" -Method GET -Headers $authHeaders
      $submissionId = $app.pendingApplicationSubmission.id
      if (-not $submissionId) {
        $new = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions" -Method POST -Headers $jsonHeaders -Body ''
        $submissionId = $new.id
      }

      $submission = Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions/$submissionId" -Method GET -Headers $authHeaders
      $sas = $submission.fileUploadUrl

      Write-Output "Uploading zip to blob..."
      & curl.exe -X PUT -T $zip -H 'x-ms-blob-type: BlockBlob' $sas
      if ($LASTEXITCODE -ne 0) { throw 'ZIP upload to Azure blob failed.' }

      $newPackages = foreach ($asset in $found) {
        $path = $asset.FullName
        $arch = if ($asset.Name -like '*-x64.*') { 'X64' } else { 'Arm64' }
        $version = Get-AppxVersion $path
        @{
          fileName = $asset.Name
          fileStatus = 'PendingUpload'
          version = $version
          architecture = $arch
          languages = (Get-AppxLanguages $path)
          capabilities = @()
          minimumDirectXVersion = 'None'
          minimumSystemRam = 'None'
        }
      }

      $packages = [System.Collections.Generic.List[object]]::new()
      foreach ($pkg in $submission.applicationPackages) {
        $pkg.fileStatus = 'PendingDelete'
        $packages.Add($pkg)
      }
      foreach ($p in $newPackages) {
        $packages.Add($p)
      }
      $submission.applicationPackages = $packages

      $payload = $submission | ConvertTo-Json -Depth 100
      $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
      Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions/$submissionId" -Method PUT -Headers $authHeaders -ContentType 'application/json; charset=utf-8' -Body $payloadBytes

      Invoke-RestMethod -Uri "https://manage.devcenter.microsoft.com/v1.0/my/applications/$appId/submissions/$submissionId/commit" -Method POST -Headers $authHeaders -ContentType 'application/json' -Body ''
      Write-Output "Submission $submissionId committed for certification."
      ```
    - If the packages are already up to date for the current version, use the image-only upload script to send the Store listing screenshots and commit without re-downloading packages:
      ```powershell
      $ErrorActionPreference = 'Stop'

      $tenantId = $env:AZURE_AD_TENANT_ID
      $clientId = $env:AZURE_AD_GH_CLIENT_ID
      $clientSecret = $env:AZURE_AD_GH_SECRET
      $appId = '9PG7L9JR8K6M'
      $docsImgDir = Join-Path (Get-Location) 'docs\img'

      function Get-StoreToken {
        $body = @{ grant_type='client_credentials'; client_id=$clientId; client_secret=$clientSecret; scope='https://manage.devcenter.microsoft.com/.default' }
        $res = Invoke-RestMethod -Uri ('https://login.microsoftonline.com/' + $tenantId + '/oauth2/v2.0/token') -Method POST -Body $body
        return $res.access_token
      }

      function Get-Submission($token, $id) {
        $wc = New-Object System.Net.WebClient
        $wc.Encoding = [System.Text.Encoding]::UTF8
        $wc.Headers.Add('Authorization', 'Bearer ' + $token)
        $json = $wc.DownloadString('https://manage.devcenter.microsoft.com/v1.0/my/applications/' + $appId + '/submissions/' + $id)
        return ($json | ConvertFrom-Json)
      }

      function Put-Submission($token, $id, $submission) {
        $wc = New-Object System.Net.WebClient
        $wc.Encoding = [System.Text.Encoding]::UTF8
        $wc.Headers.Add('Authorization', 'Bearer ' + $token)
        $wc.Headers.Add('Content-Type', 'application/json; charset=utf-8')
        $payload = $submission | ConvertTo-Json -Depth 100
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $url = 'https://manage.devcenter.microsoft.com/v1.0/my/applications/' + $appId + '/submissions/' + $id
        $resBytes = $wc.UploadData($url, 'PUT', $bytes)
        $resString = [System.Text.Encoding]::UTF8.GetString($resBytes)
        return ($resString | ConvertFrom-Json)
      }

      $token = Get-StoreToken
      $app = Invoke-RestMethod -Uri ('https://manage.devcenter.microsoft.com/v1.0/my/applications/' + $appId) -Method GET -Headers @{ Authorization = 'Bearer ' + $token }
      $submissionId = $app.pendingApplicationSubmission.id
      $submission = Get-Submission $token $submissionId
      $sas = $submission.fileUploadUrl

      $temp = Join-Path $env:TEMP 'store-listing-images'
      Remove-Item -Recurse -Force $temp -ErrorAction SilentlyContinue
      New-Item -ItemType Directory -Path $temp -Force | Out-Null

      $imgFiles = Get-ChildItem (Join-Path $docsImgDir '*.png') -File | Sort-Object Name | Select-Object -First 10
      Copy-Item -Path $imgFiles -Destination $temp

      $zip = Join-Path $env:TEMP 'store-listing-images.zip'
      Remove-Item -Force $zip -ErrorAction SilentlyContinue
      Add-Type -AssemblyName System.IO.Compression.FileSystem
      [System.IO.Compression.ZipFile]::CreateFromDirectory($temp, $zip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

      Write-Output ('Uploading image zip to ' + $sas)
      & 'curl.exe' -X PUT -T $zip -H 'x-ms-blob-type: BlockBlob' $sas
      if ($LASTEXITCODE -ne 0) { throw 'ZIP upload to Azure blob failed.' }

      Put-Submission $token $submissionId $submission | Out-Null

      $wc = New-Object System.Net.WebClient
      $wc.Encoding = [System.Text.Encoding]::UTF8
      $wc.Headers.Add('Authorization', 'Bearer ' + $token)
      $wc.Headers.Add('Content-Type', 'application/json')
      $wc.UploadString('https://manage.devcenter.microsoft.com/v1.0/my/applications/' + $appId + '/submissions/' + $submissionId + '/commit', 'POST', '')
      Write-Output ('Submission ' + $submissionId + ' committed for certification')
      ```

    - Monitor Partner Center for the certification status.

12. **Remove the `.appx` assets from GitHub and publish the release**
    - Once the Microsoft Store submission has been committed and is in certification, the `.appx` files are no longer needed on the GitHub draft release.
    - Delete the package assets and publish the release:
      ```powershell
      $tag = 'vX.Y.Z'
      $repo = 'xfuentes/smart-video-processor'

      gh release delete-asset $tag 'smart-video-processor-x64.appx' --yes -R $repo
      gh release delete-asset $tag 'smart-video-processor-arm64.appx' --yes -R $repo
      gh release edit $tag --draft=false -R $repo
      ```
