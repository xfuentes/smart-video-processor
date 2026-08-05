---
name: partner-center-management
description: Manage Microsoft Partner Center submissions and listings for the Smart Video Processor app through the Partner Center REST API.
---

## Authentication

All Partner Center API calls require an Azure AD access token obtained via client credentials.

### Required environment variables

- `AZURE_AD_TENANT_ID` - Azure AD tenant ID.
- `AZURE_AD_GH_CLIENT_ID` - Azure AD application (client) ID.
- `AZURE_AD_GH_SECRET` - Azure AD application client secret.

## Token acquisition

1. Request an access token from Azure AD:
   ```
   POST https://login.microsoftonline.com/{AZURE_AD_TENANT_ID}/oauth2/v2.0/token
   Content-Type: application/x-www-form-urlencoded

   client_id={AZURE_AD_GH_CLIENT_ID}
   &client_secret={AZURE_AD_GH_SECRET}
   &scope=https://manage.devcenter.microsoft.com/.default
   &grant_type=client_credentials
   ```
2. Extract `access_token` from the JSON response.
3. Include the token in subsequent API calls as `Authorization: Bearer {access_token}`.

## Partner Center API

Base URL: `https://manage.devcenter.microsoft.com/v1.0/my`

### Common endpoints

- `GET /applications` - list registered applications.
- `GET /applications/{applicationId}` - get an application.
- `GET /applications/{applicationId}/submissions` - list submissions.
- `POST /applications/{applicationId}/submissions` - create a new submission.
- `GET /applications/{applicationId}/submissions/{submissionId}` - get a submission.
- `PUT /applications/{applicationId}/submissions/{submissionId}` - update a submission.
- `GET /applications/{applicationId}/submissions/{submissionId}/listings` - get listings.
- `PUT /applications/{applicationId}/submissions/{submissionId}/listings` - update listings.

### Listing updates without a release

Updating store listings (descriptions, screenshots, keywords, release notes, etc.) can be done through the listings endpoints without submitting a new application package. Ensure the target submission is in a modifiable state before calling `PUT` on the listings endpoint.

## Workflow

1. Verify that `AZURE_AD_TENANT_ID`, `AZURE_AD_GH_CLIENT_ID`, and `AZURE_AD_GH_SECRET` are set.
2. Obtain an Azure AD access token.
3. Identify the target `applicationId` and, if needed, the `submissionId`.
4. Call the relevant Partner Center REST endpoint with the bearer token.
5. Validate the HTTP response and handle errors appropriately.

## Encoding

All JSON payloads and third-party API responses (e.g., Google Translate translations) must be handled as UTF-8. On Windows PowerShell 5.1, `Invoke-RestMethod` often decodes responses and encodes request bodies using the system code page, which corrupts accented characters into mojibake. Use `System.Net.WebClient` with `Encoding = [System.Text.Encoding]::UTF8`, or decode raw bytes with `[System.Text.Encoding]::UTF8.GetString()`. Always read local JSON files with `Get-Content -Encoding UTF8`.

## Security notes

- Never commit `AZURE_AD_GH_SECRET` or any access token to the repository.
- Keep credentials in environment variables or a secure vault.
- Confirm the Azure AD application has the necessary Partner Center API permissions before running operations.
