---
description: Build, sign and install the AppX package locally for testing
---

# Local AppX test workflow

Builds the `appx` target, signs it with a self-signed certificate, and installs it for local testing.

The certificate is stored in `.devin/workflows/` so it can be reused across runs.

## One-time setup

1. **Generate the self-signed certificate** (if `test-appx-cert.pfx` is not present):
   ```powershell
   $subject = 'CN=F8CDDB61-F860-4CB9-B176-609E178A4DA9'
   $cert = New-SelfSignedCertificate -Type Custom -KeyUsage DigitalSignature `
     -Subject $subject `
     -CertStoreLocation 'Cert:\CurrentUser\My' `
     -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.3','2.5.29.19={text}') `
     -FriendlyName 'Smart Video Processor Local Test' `
     -NotAfter (Get-Date).AddYears(5) `
     -KeyExportPolicy Exportable

   $password = ConvertTo-SecureString -String 'test-appx-cert' -AsPlainText -Force
   $cert | Export-PfxCertificate -FilePath '.devin/workflows/test-appx-cert.pfx' -Password $password
   $cert | Export-Certificate -FilePath '.devin/workflows/test-appx-cert.cer'
   ```

2. **Trust the certificate once as administrator**:
   - Open an elevated PowerShell prompt.
   - Run:
   ```powershell
   $password = ConvertTo-SecureString -String 'test-appx-cert' -AsPlainText -Force
   Import-PfxCertificate -CertStoreLocation 'Cert:\LocalMachine\TrustedPeople' -FilePath '.devin/workflows/test-appx-cert.pfx' -Password $password
   ```

## Build, sign and install

3. **Build and package the AppX**:
   ```powershell
   yarn build
   npx electron-builder --win appx
   ```

4. **Patch the AppX for sideloading** (remove `uap10:PackageIntegrity`, which is only valid for Store-signed packages):
   ```powershell
   $tmp = Join-Path $env:TEMP 'svp-appx-local'
   if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
   New-Item -ItemType Directory -Path $tmp -Force | Out-Null

   $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
   $makeappx = (Get-ChildItem -Path 'C:\Program Files*\Windows Kits\10\bin' -Recurse -Filter 'makeappx.exe' -ErrorAction SilentlyContinue |
     Where-Object { $_.FullName -like "*\$arch\makeappx.exe" } |
     Sort-Object FullName -Descending |
     Select-Object -First 1).FullName
   if (-not $makeappx) { throw 'makeappx.exe not found' }

   & $makeappx unpack /p dist\smart-video-processor-x64.appx /d $tmp /o

   $manifestPath = Join-Path $tmp 'AppxManifest.xml'
   [xml]$manifest = Get-Content $manifestPath -Raw
   $nsmgr = New-Object System.Xml.XmlNamespaceManager($manifest.NameTable)
   $nsmgr.AddNamespace('uap10', 'http://schemas.microsoft.com/appx/manifest/uap/windows10/10')
   $pi = $manifest.SelectSingleNode('//uap10:PackageIntegrity', $nsmgr)
   if ($pi) { $pi.ParentNode.RemoveChild($pi) | Out-Null }
   $ign = $manifest.Package.IgnorableNamespaces -split ' ' | Where-Object { $_ -ne 'uap10' }
   $manifest.Package.IgnorableNamespaces = ($ign -join ' ').Trim()
   $manifest.Save($manifestPath)

   Remove-Item -Path dist\smart-video-processor-x64-patched.appx -ErrorAction SilentlyContinue
   & $makeappx pack /d $tmp /p dist\smart-video-processor-x64-patched.appx /o
   ```

5. **Sign the patched AppX**:
   ```powershell
   $arch = if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64') { 'arm64' } else { 'x64' }
   $signtool = (Get-ChildItem -Path 'C:\Program Files*\Windows Kits\10\bin' -Recurse -Filter 'signtool.exe' -ErrorAction SilentlyContinue |
     Where-Object { $_.FullName -like "*\$arch\signtool.exe" } |
     Sort-Object FullName -Descending |
     Select-Object -First 1).FullName
   if (-not $signtool) { throw 'signtool.exe not found' }
   & $signtool sign /fd sha256 /f .devin/workflows/test-appx-cert.pfx /p test-appx-cert /v dist\smart-video-processor-x64-patched.appx
   ```

6. **Install the signed AppX**:
   ```powershell
   Get-AppxPackage -Name 'XavierFuentes.SmartVideoProcessor' | Remove-AppxPackage -ErrorAction SilentlyContinue
   Add-AppxPackage -Path dist\smart-video-processor-x64-patched.appx
   ```

7. **Launch the app** from the Start menu or by running `svp.exe`.

## Future runs

After the certificate is trusted, only steps 3-6 are needed. The certificate files in `.devin/workflows/` are reused.
