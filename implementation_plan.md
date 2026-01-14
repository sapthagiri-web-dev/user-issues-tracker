# Implementation Plan - Supabase Backend Migration

I will migrate the application from using `MOCK_ISSUES` to a real Supabase backend.

## User Action Required

> [!IMPORTANT] > **Step 1**: You need to go to [supabase.com](https://supabase.com), sign up, and "Create a new project".
> **Step 2**: Once created, you will need to copy the **Project URL** and **API Key (anon/public)**.

## Proposed Changes

### 1. Setup & Configuration/Dependencies

- **Install**: `npm install @supabase/supabase-js`.
- **Config**: Create `.env` file to store `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Client**: Create `src/supabaseClient.js` to initialize the connection.

### 2. Database Schema (I will provide the SQL to run in Supabase SQL Editor)

- **Table `profiles`**: Users (Residents/Officials).
- **Table `issues`**: The main issues.
- **Table `issue_attachments`**: Links files to issues.
- **RLS Policies**: Security rules (e.g., "Officials can delete").

### 3. Frontend Refactoring

#### [MODIFY] `src/pages/Dashboard.jsx`

- Remove `MOCK_ISSUES`.
- Use `useEffect` to `supabase.from('issues').select('*')`.
- Handle loading state.

#### [MODIFY] `src/pages/IssueDetails.jsx`

- Fetch specific issue by ID.
- Fetch linked attachments.
- **Upload**: Implement real file upload to Supabase Storage bucket `issue-attachments`.

## Verification Plan

### Manual Verification

1. **Connection**: Verify the app doesn't crash on start.
2. **Data Flow**: Create a row in Supabase Table Editor -> Refresh App -> See it appear.
3. **Upload**: Upload a real file -> Check Supabase Storage bucket -> See file.
