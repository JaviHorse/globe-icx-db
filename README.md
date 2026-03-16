## Globe iCX Quick Check-in Dashboard (Next.js)

Next.js (App Router) dashboard that reads consolidated Google Forms responses from Google Sheets and renders a per-group iCX dashboard (question card + responses table + pagination).

## Getting Started

### 1) Configure Google Sheets credentials

This app reads from:

- **Spreadsheet ID**: `1S1Gca6lv1LlHx3ye5qtnYFmGRXbL9YLxwvBAKlFYXJc`
- **Default range**: `Consolidated!A:ZZ` (override with `GOOGLE_SHEETS_RANGE` if needed)

You must provide a Google **service account** that has **Viewer** access to the sheet.

Provide credentials using either:

- **Option A (recommended)**: `GOOGLE_APPLICATION_CREDENTIALS` pointing to the service account JSON file
- **Option B**: `GOOGLE_CLIENT_EMAIL` + `GOOGLE_PRIVATE_KEY` (or `GOOGLE_PRIVATE_KEY_BASE64`)

#### PowerShell examples

Option A:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
```

Option B:

```powershell
$env:GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
$env:GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Optional overrides:

```powershell
$env:GOOGLE_SHEETS_ID="1S1Gca6lv1LlHx3ye5qtnYFmGRXbL9YLxwvBAKlFYXJc"
$env:GOOGLE_SHEETS_RANGE="Consolidated!A:ZZ"
```

### 2) Run the dev server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open `http://localhost:3000` with your browser to see the result.

### API

- `GET /api/responses`: fetches the sheet, normalizes rows into the dashboard record shape, groups by `group`, and returns `{ groups, groupedResponses, updatedAt }`.

### Troubleshooting

- If `/api/responses` returns **missing env** errors, ensure the variables are set in the same shell session that launched `npm run dev` (or restart the dev server after setting them).
