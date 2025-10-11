# Is It? - Epigram Display Application

A modern web application that displays thought-provoking epigrams with automatic rotation and user submission capabilities.

## Version 1.0 Features

### Core Functionality

- **Epigram Display**: Beautiful, responsive cards showing curated epigrams
- **Auto-Reload Timer**: Configurable automatic epigram rotation (1-240 minutes)
- **Manual Refresh**: Instant epigram refresh with a single click
- **User Submissions**: Submit your own epigrams for display
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Experience

- **Consistent Layout**: Fixed-width epigram cards for visual consistency
- **Settings Panel**: Easy configuration of auto-reload preferences
- **Submission Panel**: Simple form for contributing epigrams
- **Notifications**: Friendly success and error messages with automatic dismissal
- **Timer Display**: Real-time countdown showing next epigram change
- **Exit Confirmations**: Prevents accidental data loss when closing panels
- **Form Validation**: Real-time feedback on submission form

### Technical Features

- **Docker Deployment**: Complete containerized setup with Docker Compose
- **PostgreSQL Database**: Robust data storage with Alembic migrations
- **Vue.js Frontend**: Modern reactive UI with TypeScript
- **FastAPI Backend**: High-performance Python API
- **Browser Storage**: User preferences persist locally
- **Queue System**: Pre-fetched epigrams ensure smooth transitions
- **"Get Mine" API**: Retrieve user's previously submitted epigrams (client ID-based)

## Version 2.0 Planned Improvements

### User Authentication System

- **Guest Mode**:

  - View epigrams and manual refresh only
  - No auto-reload or submission features
  - Clean, minimal interface

- **User Accounts**:
  - Simple username/password registration
  - Standard password requirements (8+ chars, mixed case, numbers)
  - Secure authentication with JWT tokens

### Enhanced User Experience

- **Dynamic Header**:

  - **Guests**: Login/Signup buttons in top-right
  - **Logged-in Users**: Settings and submission icons

- **Personalized Settings**:
  - Auto-reload preferences stored per user
  - Custom timer intervals saved to database
  - Submission history tracking

### Backend Enhancements

- **New Database Tables**:

  - `users` - User accounts and profiles
  - `user_settings` - Individual auto-reload preferences
  - Enhanced `epigrams` - Link submissions to users

- **New API Endpoints**:
  - `/auth/register` - User registration
  - `/auth/login` - User authentication
  - `/auth/logout` - Session termination
  - `/users/settings` - Get/update user preferences
  - `/users/submissions` - User's submission history

## Technology Stack

### Frontend

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vite** for development and building
- **Tailwind CSS** for styling

### Backend

- **FastAPI** (Python) for API
- **SQLModel** for database ORM
- **Alembic** for database migrations
- **PostgreSQL** for data storage
- **Pydantic** for data validation

### DevOps

- **Docker** & **Docker Compose** for containerization
- **Environment-based configuration**

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd is-it-
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   # Make sure to set DATABASE_URL and other required variables
   ```

3. **Start the application with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   This will build and start all containers (frontend, backend, and database).

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Project Structure

```
is-it-/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── api/           # API routes
│   │   └── main.py        # Application entry point
│   ├── alembic/           # Database migrations
│   └── requirements.txt   # Python dependencies
├── frontend/               # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── stores/        # Pinia stores
│   │   ├── services/      # API and utility services
│   │   └── views/         # Page components
│   └── package.json       # Node.js dependencies
├── docker-compose.yaml     # Container orchestration
└── README.md              # This file
```

## Key Features in Detail

### Auto-Reload System

- **Single Timer**: One active timer prevents conflicts
- **Configurable Intervals**: 1-240 minutes with hour/minute precision
- **Smart Reset**: Timer resets on manual actions and successful submissions
- **Visual Countdown**: Real-time display of remaining time

### Notification System

- **Success Messages**: Friendly confirmation for successful actions
- **Error Alerts**: Clear explanations when something goes wrong
- **Timed Dismissal**: Messages automatically disappear after a few seconds
- **Manual Dismissal**: Users can close notifications early if desired

### Epigram Queue

- **Pre-fetching**: Background loading ensures smooth transitions
- **Efficient Loading**: Batch API calls minimize server requests
- **Automatic Refill**: Queue maintains optimal size automatically

### Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Consistent Width**: Fixed epigram card dimensions
- **Touch Friendly**: Large buttons and touch targets

## Version Migration Path

### User Experience Evolution: V1 to V2

**V1 (Current Version):**

- Users interact anonymously with browser-based settings
- All users have full access to all features (auto-reload, submissions)
- Settings are stored locally in the browser and lost when clearing cache
- Submissions are tracked via browser client ID (semi-persistent)
- Simple, straightforward interface with minimal configuration

**V2 (Planned Version):**

- Guest users have limited access (view and manual refresh only)
- Registered users gain access to auto-reload and submission features
- User settings persist across devices and browsers via database storage
- Submissions are permanently linked to user accounts
- Personalized experience with user-specific history and preferences

### V1 to V2 Migration

1. **Database Schema Updates**

   - Add user authentication tables
   - Migrate existing settings to user-based storage
   - Preserve existing epigrams and submissions

2. **API Compatibility**

   - Maintain existing endpoints for backward compatibility
   - Add new authenticated endpoints
   - Implement graceful fallbacks for guest users

3. **Frontend Enhancements**
   - Add authentication components
   - Update header with dynamic content
   - Implement user-specific settings management
