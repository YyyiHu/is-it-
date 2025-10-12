# Is It? - Epigram Display Application

A modern web application that displays thought-provoking epigrams with automatic rotation and user submission capabilities. The application is fully responsive and works perfectly on both desktop and mobile devices.

## Features

### Core Functionality

- **Epigram Display**: Beautiful, responsive cards showing curated epigrams
- **User Authentication**: Secure login and registration system
- **Auto-Reload Timer**: Configurable automatic epigram rotation (1-240 minutes)
- **Manual Refresh**: Instant epigram refresh with a single click
- **User Submissions**: Submit your own epigrams for display
- **Submission History**: View and manage your submitted epigrams
- **Cross-Platform**: Optimized for desktop, tablet, and mobile devices

### User Experience

- **Consistent Layout**: Fixed-width epigram cards for visual consistency
- **User Dashboard**: Access your submissions and settings after login
- **Settings Panel**: Easy configuration of auto-reload preferences
- **Submission Panel**: Simple form for contributing epigrams
- **Notifications**: Success and error messages with automatic dismissal
- **Timer Display**: Real-time countdown showing next epigram change
- **Exit Confirmations**: Prevents accidental data loss when closing panels
- **Form Validation**: Real-time feedback on submission forms

### Technical Features

- **Docker Deployment**: Complete containerized setup with Docker Compose
- **PostgreSQL Database**: Robust data storage with Alembic migrations
- **Vue.js Frontend**: Modern reactive UI with TypeScript
- **FastAPI Backend**: High-performance Python API
- **Secure Authentication**: HTTP-only cookies with JWT tokens
- **TanStack Query**: Efficient data fetching and synchronization
- **Queue System**: Pre-fetched epigrams ensure smooth transitions

## User Interface

After logging in, users have access to several features through the header buttons:

1. **Pencil Icon (Submit)**: Opens the submission panel to add a new epigram

   - Each epigram must be unique in the system
   - Submissions are linked to your account
   - Character limits ensure quality content

2. **Gear Icon (Settings)**: Configure auto-reload preferences

   - Enable/disable automatic epigram rotation
   - Set custom interval (1-240 minutes)
   - Settings are saved to your account and persist across devices

3. **History Icon (My Epigrams)**: View your submitted epigrams

   - See all your previous submissions
   - Select any submission to display it
   - Edit or delete your own epigrams

4. **Logout Icon**: Securely end your session

When auto-reload is enabled, a timer appears showing the countdown until the next epigram change.

## Technology Stack

### Frontend

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **TanStack Query** for data fetching
- **Vite** for development and building
- **Tailwind CSS** for styling

### Backend

- **FastAPI** (Python) for API
- **SQLModel** for database ORM
- **Alembic** for database migrations
- **PostgreSQL** for data storage
- **Pydantic** for data validation
- **Argon2** for secure password hashing
- **JWT** for authentication tokens

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
   cp env.example .env
   # Edit .env with your preferred settings
   # Make sure to set DATABASE_URL, SECRET_KEY and other required variables
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

## Key Features in Detail

### Authentication System

- **Secure Registration**: Username and strong password requirements
- **HTTP-Only Cookies**: JWT tokens stored in secure cookies
- **Automatic Login**: Users remain logged in across sessions
- **Guest Access**: Limited functionality for non-authenticated users

### Auto-Reload System

- **Single Timer**: One active timer prevents conflicts
- **Configurable Intervals**: 1-240 minutes with precision
- **Smart Reset**: Timer resets on manual actions and successful submissions
- **Visual Countdown**: Real-time display of remaining time
- **Cross-Device Sync**: Settings automatically sync between devices
- **Self-Healing**: Timer automatically recovers from errors or interruptions
- **Initialization Control**: Timer only starts when properly initialized with user settings

### Epigram Submission

- **User Attribution**: All submissions linked to user accounts
- **Validation**: Ensures quality content with character limits
- **Duplicate Detection**: Prevents identical epigrams
- **Optional Author**: Add attribution or submit anonymously

### Notification System

- **Success Messages**: Friendly confirmation for successful actions
- **Error Alerts**: Clear explanations when something goes wrong
- **Timed Dismissal**: Messages automatically disappear after 3 seconds
- **Manual Dismissal**: Users can close notifications early if desired

### Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Consistent Width**: Fixed epigram card dimensions
- **Touch Friendly**: Large buttons and touch targets
- **CSS Variables**: Theme-consistent styling across components
