# Implementation Plan - Issue Details Navigation

I will add client-side routing to enable a dedicated "Issue Details" page when a user clicks "View Details".

## User Review Required

> [!IMPORTANT] > **Dependency Addition**: I will install `react-router-dom` to handle navigation between pages.

## Proposed Changes

### 1. Project Structure

- Turn `App.jsx` into the layout/router container.
- Move current dashboard content to a new page component: `src/pages/Dashboard.jsx`.

### 2. Dependencies

- Install `react-router-dom`.

### 3. Components & Pages

#### [NEW] `src/pages/Dashboard.jsx`

- Contains the existing "Grama Samasya" header and `IssueCard` grid.
- Allows `App.jsx` to be clean.

#### [NEW] `src/pages/IssueDetails.jsx`

- Displays full details of a specific issue.
- **Route**: `/issue/:id`
- **Content**:
  - Title, Status, Description (mock text).
  - Extended details about Affected User & Creator.
  - "Back to Dashboard" button.
  - Consistent "Rural" styling.

#### [MODIFY] `src/App.jsx`

- Setup `<BrowserRouter>`, `<Routes>`, and `<Route>`.
- Define routes:
  - `/` -> `Dashboard`
  - `/issue/:id` -> `IssueDetails`

#### [MODIFY] `src/components/IssueCard.jsx`

- Change "View Details" button to a link/navigate action to `/issue/${id}`.

## Verification Plan

### Automated Tests

- None.

### Manual Verification

- Click "View Details" on a card -> Verify URL changes to `/issue/1` and Details page loads.
- Click "Back" -> Verify return to Dashboard.
