# Is it? Requirements

## Goal

Build a small web app that shows a random epigram on the web. Visitors can load another epigram, enable or disable automatic reloading, and submit new epigrams. A Python backend provides storage in PostgreSQL.

## Stack

**Frontend:** Vite + React 18 + Redux Toolkit for UI state and TanStack Query for server state  
**Backend:** FastAPI with SQLModel and Alembic on Uvicorn  
**Database:** PostgreSQL shared for development and production

## Must Have

- Show a random approved epigram on first load
- Floating Load new button to fetch another epigram
- Settings panel to toggle auto reload with default ten minutes
- Contribute panel to submit text and optional author
- Store and retrieve data from PostgreSQL

## Should Have

- Basic client and server validation
- Clear empty loading and error states
- Simple rate limit such as five submissions per minute per IP
- History icon and drawer that lists submissions from this browser even without login
  - Use a persistent client id stored in localStorage and a cookie
  - Show items returned from the server and allow View to display one on the main area
  - Show empty state when there is no submission yet

## Could Have if time allows

- Custom auto reload interval
- List and search epigrams by text or author

## Future Features

- Accounts and login so users can persistently view and manage their own contributions across devices
- Users can edit and delete their own contributions
- Roles for moderation so moderators and admins can approve or reject pending items
- Pagination and richer search in the browse view

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
  "author": "string optional",
  "client_id": "string optional"
}
```

## Data Model

### Epigram

| Field      | Type             | Description                               |
| ---------- | ---------------- | ----------------------------------------- |
| id         | int primary key  | Unique identifier                         |
| text       | string up to 500 | Epigram content                           |
| author     | string up to 100 | Optional author name                      |
| status     | smallint         | zero pending one approved two rejected    |
| client_id  | string optional  | Anonymous browser identifier UUID         |
| created_at | timestamptz      | Creation timestamp                        |
| updated_at | timestamptz      | Last update timestamp(for future feature) |

Default status is one on insert

## Contribution Interaction

- Pencil icon always visible in the header
- Opens a right side Contribute drawer with a textarea for text an input for author and a submit button that stays disabled until valid
- On submit the drawer closes a toast confirms creation and the app can refetch a random epigram or display the new submission

## History Interaction without login

- On first app load generate or read a client id from localStorage and set a cookie copy
- When submitting include client_id in the POST body so the server stores it on the row
- The History drawer calls GET slash api slash epigrams slash mine with client_id to fetch this browser submissions and caches them locally
- Clicking a row sets the selected epigram as the current display
- If localStorage is empty but the cookie exists the app can rebuild history by calling the mine endpoint

### Validation

- Client side

  - text required and at most 500 characters
  - author at most 100 characters

- Server side
  - same rules enforced in FastAPI
  - trim and normalize whitespace

### Error Handling

- If the backend is unreachable
  - keep the drawer visible
  - disable Submit
  - show an inline retry message
