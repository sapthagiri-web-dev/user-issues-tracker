# Implementation Plan - Fix Document Download

I will fix the non-functional download button by implementing a client-side simulated download.

## User Review Required

> [!NOTE]
> Since there are no real files on a server, I will generate a generic text file on the fly when "Download" is clicked, containing the filename as its content.

## Proposed Changes

### 1. Component Logic (`src/pages/IssueDetails.jsx`)

#### [MODIFY] `IssueDetails.jsx`

- Add `handleDownload(file)` function.
- **Logic**:
  - Create a `Blob` with text content: `"Content of <filename>..."`.
  - Create an object URL `URL.createObjectURL(blob)`.
  - Create a temporary hidden `<a>` tag, set `href` and `download` attributes.
  - Programmatically click it.
  - Revoke the URL.
- **UI Update**: Change the download button `onClick` to trigger this function.

## Verification Plan

### Manual Verification

- Click the download icon on an attachment.
- Verify that a file is actually downloaded to the user's computer.
- Open the file and check if it contains the dummy text.
