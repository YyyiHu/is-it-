# Is it? Requirements

## Goal

Build a small web app that shows a random epigram on the web. Visitors can load another epigram, enable or disable automatic reloading, and submit new epigrams. A Python backend provides storage in PostgreSQL.

## Stack

**Frontend:** Vite + Vue 3 + TypeScript + Pinia for UI state + TanStack Query for server state  
**Backend:** FastAPI with SQLModel and Alembic on Uvicorn  
**Database:** PostgreSQL

## Must Have

- Show a random approved epigram on first load
- Floating Load new button to fetch another epigram
- Settings panel to toggle auto reload:
  - Default to enabled with ten minute interval
  - Clear toggle button to enable/disable
- Contribute panel to submit text and optional author
- Store and retrieve data from PostgreSQL
- Basic client and server validation

## Should Have

- Show empty state when there is no submission yet
- Clear empty loading and error states

## Could Have if time allows

- Custom auto reload interval (default is 5 minutes)
- History icon and drawer (authenticated users only):
  - Shows user's submitted epigrams with infinite scroll
  - Each item shows text preview and author
  - Items are clickable to display full epigram in center
  - Most recent submissions at the top (ordered by last updated time)
  - Users can edit or delete their own epigrams from the history panel
  - Selected epigram is highlighted in the history list
- Advanced performance features:
  - TanStack Query integration:
    - Efficient server state caching
    - Background polling with smart retry
    - Optimistic UI updates for submissions
  - Prefetch multiple random epigrams for instant display

## Future Features

- Browse all epigrams feature:
  - Book icon in header opens browse drawer
  - List all approved epigrams, newest first
  - Click any epigram to display in center
  - Search by text or author
  - Infinite scroll pagination
  - Debounced search
- Roles for moderation so moderators and admins can approve or reject pending items
- Pagination and richer search in the browse view
- Categorize epigrams by tags
- Search epigrams by tags and keywords

## API v1

| Method | Endpoint               | Description                                            |
| ------ | ---------------------- | ------------------------------------------------------ |
| GET    | `/api/epigrams/random` | Return one random approved epigram                     |
| POST   | `/api/epigrams`        | Create a new epigram that is approved by default in v1 |
| GET    | `/api/epigrams/mine`   | Return submissions created by this browser id          |

**POST body**

```json
{
  "text": "string",
  "author": "string optional"
}
```

## Data Model

### Epigram

| Field      | Type             | Description                            |
| ---------- | ---------------- | -------------------------------------- |
| id         | int primary key  | Unique identifier                      |
| text       | string up to 150 | Epigram content                        |
| author     | string up to 50  | Optional author name                   |
| status     | smallint         | zero pending one approved two rejected |
| user_id    | int foreign key  | User who submitted this epigram        |
| created_at | timestamptz      | Creation timestamp                     |
| updated_at | timestamptz      | Last update timestamp                  |

Default status is one on insert

## Contribution Interaction

- Pencil icon always visible in the header with tooltip
- Right side Contribute drawer with:
  - Textarea for text with character counter and validation state
  - Input for author (optional) with character counter
  - Submit button with clear enabled/disabled state
  - Inline validation feedback for each field
- Form submission flow:
  - Show loading state during submission
  - Display success toast on completion
  - Close drawer and:
    - Show the newly submitted epigram in the center display immediately
    - Add it to the history drawer automatically
  - TanStack Query handles optimistic updates
  - "Load new" button still available to fetch random epigrams

## History Interaction without login

- On first app load generate or read a client id from localStorage and set a cookie copy
- When submitting, the server automatically associates the epigram with the client_id from the cookie
- The History drawer calls GET /api/epigrams/mine (client_id sent automatically via cookie) to fetch this browser's submissions and caches them locally
- History interaction:
  - Clicking any epigram in history immediately displays it in the center
  - User can then:
    - Keep viewing the selected epigram
    - Click "Load new" to get a random one instead
  - If localStorage is empty but the cookie exists, rebuild history by calling the mine endpoint

### Validation and User Feedback

- Client side

  - Text field:
    - Required with clear "required" indicator
    - Max 150 characters with character counter
    - Real-time validation feedback
  - Author field:
    - Optional with clear "optional" indicator
    - Max 50 characters with character counter
  - Form-level validation:
    - Disable submit button when invalid
    - Show field-specific error messages
    - Use Vue 3's composition API for reactive validation

- Server side
  - Rules enforced in FastAPI:
    - Text length and required status
    - Author length if provided
    - Whitespace trimming and normalization
  - Return validation errors as structured response
  - Client displays server validation errors inline

### Error Handling

- If the backend is unreachable
  - keep the drawer visible
  - disable Submit
  - show an inline retry message
  - use Vue's error boundaries for component-level error handling
